import { ReactElement } from "react";

import { Button, Intent } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { formatUnits } from "ethers/lib/utils";
import { PrincipalPoolTokenInfo, PrincipalTokenInfo } from "tokenlists/types";
import { t } from "ttag";

import { BALANCER_POOL_LP_TOKEN_DECIMALS } from "efi-balancer/pools";
import tw from "efi-tailwindcss-classnames";
import { SwapKind } from "efi-ui/balancer/SwapKind";
import { useNumericInput } from "efi-ui/base/hooks/useNumericInput/useNumericInput";
import { findAssetIcon2 } from "efi-ui/crypto/CryptoIcon";
import { useCryptoBalanceOf } from "efi-ui/crypto/hooks/useCryptoBalance/useCryptoBalance";
import { usePoolTokens } from "efi-ui/pools/usePoolTokens/usePoolTokens";
import { usePoolTotalSupply } from "efi-ui/pools/usePoolTotalSupply";
import { useTokenYield } from "efi-ui/pools/useTokenYield";
import { SaveInput } from "efi-ui/save/SavePortfolioList/SaveInput";
import { formatBalance } from "efi/base/formatBalance";
import { formatPercent } from "efi/base/formatPercent";
import { clipStringValueToDecimals } from "efi/base/math/fixedPoint";
import { getCryptoAssetForToken } from "efi/crypto/getCryptoAssetForToken";
import { getCryptoDecimals } from "efi/crypto/getCryptoDecimals";
import { getCryptoSymbol } from "efi/crypto/getCryptoSymbol";
import { calcSwapOutGivenInCCPoolUNSAFE } from "efi/pools/calcPoolSwap";
import {
  getPrincipalPoolContractForTranche,
  getPrincipalPoolForTranche,
} from "efi/pools/ccpool";
import { getPoolContract } from "efi/pools/getPoolContract";
import { useParseSortedTokensForPool } from "efi/pools/parseSortedTokensForPool";
import { getTokenInfo } from "efi/tokenlists";
import { validateTradeValues } from "efi/trade/validateTradeValues";
import { underlyingContractsByAddress } from "efi/underlying/underlying";

interface BuyPrincipalTokensFormProps {
  library: Web3Provider | undefined;
  account: string | null | undefined;
  principalToken: PrincipalTokenInfo;
}

export function BuyPrincipalTokensForm(
  props: BuyPrincipalTokensFormProps
): ReactElement {
  const {
    library,
    account,
    principalToken: {
      address: ptAddress,
      extensions: { underlying },
    },
  } = props;

  // inputs
  const { stringValue: baseAssetInputValue, setValue: onBaseAssetChange } =
    useNumericInput();

  // base asset
  const baseAsset = getCryptoAssetForToken(underlying);
  const BaseAssetIcon = findAssetIcon2(baseAsset);
  const baseAssetSymbol = getCryptoSymbol(baseAsset);
  const baseAssetBalanceOf = useCryptoBalanceOf(library, account, baseAsset);
  const baseAssetDecimals = getCryptoDecimals(baseAsset) as number;
  const baseAssetBalanceLabel = formatBalance(
    baseAssetBalanceOf,
    baseAssetDecimals,
    baseAssetDecimals
  );
  const baseAssetContract = underlyingContractsByAddress[underlying];

  // pool
  const poolInfo = getPrincipalPoolForTranche(ptAddress);
  const poolContract = getPrincipalPoolContractForTranche(ptAddress);
  const apy = useTokenYield(baseAssetContract, poolContract, "principal");
  const formattedAPY = apy ? formatPercent(apy) : "-";

  // input validation
  const {
    isValidTokenInValue,
    isValidTokenOutValue,
    tokenOutError,
    tokenInError,
  } = useValidateInput(library, account, poolInfo, baseAssetInputValue);

  const buttonDisabled =
    !!tokenInError || !!tokenOutError || !baseAssetInputValue;
  let buttonIntent: Intent = Intent.PRIMARY;
  if (tokenInError || tokenOutError) {
    buttonIntent = Intent.DANGER;
  }

  return (
    <div className={tw("flex")}>
      <div
        className={tw(
          "flex",
          "flex-col",
          "w-full",
          "space-y-2",
          "justify-center"
        )}
      >
        <span
          className={tw("pb-4")}
        >{t`Buy principal tokens with your ${baseAssetSymbol}`}</span>
        <span className={tw("pb-4")}>{t`Current APY: ${formattedAPY}`}</span>
        <div className={tw("grid", "grid-cols-4", "gap-3")}>
          <SaveInput
            swapKind={SwapKind.GIVEN_IN}
            className={tw("col-span-3")}
            isValid={isValidTokenInValue && isValidTokenOutValue}
            errorMessage={tokenInError || tokenOutError}
            showMaxButton
            assetIcon={
              BaseAssetIcon ? (
                <BaseAssetIcon height={20} width={20} className={tw("ml-2")} />
              ) : undefined
            }
            value={baseAssetInputValue}
            valueBalanceOf={baseAssetBalanceOf}
            valueDecimals={baseAssetDecimals}
            onValueChange={onBaseAssetChange}
          />
          <div>
            <Button
              fill
              outlined
              large
              disabled={buttonDisabled}
              intent={buttonIntent}
            >{t`Buy`}</Button>
          </div>
        </div>
        <div className={tw("grid", "grid-cols-4", "gap-3")}>
          <span
            className={tw("col-span-3", "text-right")}
          >{t`Available balance: ${baseAssetBalanceLabel}`}</span>
        </div>
      </div>
    </div>
  );
}

function useValidateInput(
  library: Web3Provider | undefined,
  account: string | null | undefined,
  poolInfo: PrincipalPoolTokenInfo,
  amountIn: string
) {
  const {
    address: poolAddress,
    extensions: { bond, underlying, expiration, unitSeconds },
  } = poolInfo;

  const baseAsset = getCryptoAssetForToken(underlying);
  const baseAssetBalanceOf = useCryptoBalanceOf(library, account, baseAsset);

  const sortedTokens = [bond, underlying].sort();
  const { baseAssetIndex, termAssetIndex: principalTokenIndex } =
    useParseSortedTokensForPool(sortedTokens);

  const poolContract = getPoolContract(poolAddress);

  const { data: totalSupplyBN } = usePoolTotalSupply(poolContract);
  const totalSupply = formatUnits(
    totalSupplyBN ?? 0,
    BALANCER_POOL_LP_TOKEN_DECIMALS
  );

  const { data: [, balances] = [] } = usePoolTokens(poolContract);
  const underlyingReservesBalanceOf = balances?.[baseAssetIndex];
  const principalReservesBalanceOf = balances?.[principalTokenIndex];

  const { decimals: baseAssetDecimals } = getTokenInfo(underlying);
  const underlyingReserves = formatUnits(
    underlyingReservesBalanceOf ?? 0,
    baseAssetDecimals
  );
  const principalReserves = formatUnits(
    principalReservesBalanceOf ?? 0,
    baseAssetDecimals
  );

  const nowInSeconds = Math.round(Date.now() / 1000);
  const timeRemainingSeconds = expiration - nowInSeconds;
  const amountPrincipalTokensOut = calcSwapOutGivenInCCPoolUNSAFE(
    amountIn,
    underlyingReserves,
    principalReserves,
    totalSupply,
    timeRemainingSeconds,
    unitSeconds,
    true
  );
  const amountPrincipalTokensOutBN = clipStringValueToDecimals(
    amountPrincipalTokensOut.toString(),
    baseAssetDecimals ?? 18
  );

  return validateTradeValues(
    amountIn,
    amountPrincipalTokensOutBN,
    underlyingReservesBalanceOf,
    principalReservesBalanceOf,
    baseAssetBalanceOf,
    baseAssetDecimals
  );
}
