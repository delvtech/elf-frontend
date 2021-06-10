import { ReactElement } from "react";

import { Button, Intent, Tag } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { formatUnits } from "ethers/lib/utils";
import { PrincipalPoolTokenInfo, PrincipalTokenInfo } from "tokenlists/types";
import { t } from "ttag";

import { BALANCER_POOL_LP_TOKEN_DECIMALS } from "efi-balancer/pools";
import tw from "efi-tailwindcss-classnames";
import { useNumericInput } from "efi-ui/base/hooks/useNumericInput/useNumericInput";
import { usePoolTokens } from "efi-ui/pools/usePoolTokens/usePoolTokens";
import { usePoolTotalSupply } from "efi-ui/pools/usePoolTotalSupply";
import { useTokenBalanceOf } from "efi-ui/token/hooks/useTokenBalanceOf";
import { TokenAmountInput } from "efi-ui/token/TokenAmountInput/TokenAmountInput";
import { formatBalance } from "efi/base/formatBalance";
import { clipStringValueToDecimals } from "efi/base/math/fixedPoint";
import { getCryptoSymbol } from "efi/crypto/getCryptoSymbol";
import { calcSwapOutGivenInCCPoolUNSAFE } from "efi/pools/calcPoolSwap";
import { getPrincipalPoolForTranche } from "efi/pools/ccpool";
import { getPoolContract } from "efi/pools/getPoolContract";
import { useParseSortedTokensForPool } from "efi/pools/parseSortedTokensForPool";
import { getTokenInfo } from "efi/tokenlists";
import { validateTradeValues } from "efi/trade/validateTradeValues";
import { getBaseAssetForTranche } from "efi/tranche/baseAssets";
import { trancheContractsByAddress } from "efi/tranche/tranches";

interface SellPrincipalTokensFormProps {
  library: Web3Provider | undefined;
  account: string | null | undefined;
  principalToken: PrincipalTokenInfo;
}

export function SellPrincipalTokensForm(
  props: SellPrincipalTokensFormProps
): ReactElement {
  const {
    account,
    principalToken: {
      address: ptAddress,
      decimals: ptDecimals,
      symbol: ptSymbol,
    },
  } = props;
  // base asset
  const baseAsset = getBaseAssetForTranche(ptAddress);
  const baseAssetSymbol = getCryptoSymbol(baseAsset);

  // inputs
  const { stringValue: ptInputValue, setValue: onPrincipalTokenInputChange } =
    useNumericInput();

  // tranche
  const trancheContract = trancheContractsByAddress[ptAddress];
  const { data: ptBalanceOf } = useTokenBalanceOf(trancheContract, account);
  const ptBalanceLabel = formatBalance(ptBalanceOf, ptDecimals, ptDecimals);

  // pool
  const poolInfo = getPrincipalPoolForTranche(ptAddress);
  const { tokenOutError, tokenInError } = useValidateInput(
    account,
    poolInfo,
    ptInputValue
  );
  const amountOut = useCalculateUnderlyingTokenOut(poolInfo, ptInputValue);

  return (
    <div className={tw("flex", "items-center")}>
      <div className={tw("flex", "flex-col", "w-full", "space-y-2")}>
        <span
          className={tw("pb-4")}
        >{t`Sell your principal tokens for ${baseAssetSymbol}`}</span>
        <div className={tw("grid", "grid-cols-4", "gap-3")}>
          <TokenAmountInput
            className={tw("col-span-3")}
            showMaxButton
            errorMessage={tokenInError || tokenOutError}
            leftIcon={
              <Tag minimal large className={tw("ml-2")}>
                {ptSymbol}
              </Tag>
            }
            value={ptInputValue}
            maxAmount={ptBalanceOf}
            tokenDecimals={ptDecimals}
            onValueChange={onPrincipalTokenInputChange}
          />
          <div>
            <Button
              fill
              outlined
              large
              intent={Intent.PRIMARY}
            >{t`Sell`}</Button>
          </div>
        </div>
        <div className={tw("grid", "grid-cols-4", "gap-3")}>
          <span
            className={tw("col-span-3", "text-right")}
          >{t`Available balance: ${ptBalanceLabel}`}</span>
        </div>
      </div>
    </div>
  );
}

function useValidateInput(
  account: string | null | undefined,
  poolInfo: PrincipalPoolTokenInfo,
  amountIn: string
) {
  const {
    address: poolAddress,
    extensions: { bond, underlying },
  } = poolInfo;

  const trancheContract = trancheContractsByAddress[bond];
  const { data: ptBalanceOf } = useTokenBalanceOf(trancheContract, account);
  const { decimals: ptDecimals } = getTokenInfo<PrincipalTokenInfo>(bond);

  const sortedTokens = [bond, underlying].sort();
  const { baseAssetIndex, termAssetIndex: principalTokenIndex } =
    useParseSortedTokensForPool(sortedTokens);

  const poolContract = getPoolContract(poolAddress);

  const { data: [, balances] = [] } = usePoolTokens(poolContract);
  const underlyingReservesBalanceOf = balances?.[baseAssetIndex];
  const principalReservesBalanceOf = balances?.[principalTokenIndex];

  const amountPrincipalTokensOutBN = useCalculateUnderlyingTokenOut(
    poolInfo,
    amountIn
  );

  return validateTradeValues(
    amountIn,
    amountPrincipalTokensOutBN,
    underlyingReservesBalanceOf,
    principalReservesBalanceOf,
    ptBalanceOf,
    ptDecimals
  );
}

function useCalculateUnderlyingTokenOut(
  poolInfo: PrincipalPoolTokenInfo,
  amountIn: string
): string {
  const {
    address: poolAddress,
    extensions: { bond, underlying, expiration, unitSeconds },
  } = poolInfo;

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
  const amountOut = calcSwapOutGivenInCCPoolUNSAFE(
    amountIn,
    principalReserves,
    underlyingReserves,
    totalSupply,
    timeRemainingSeconds,
    unitSeconds,
    true
  );
  const amountOutBN = clipStringValueToDecimals(
    amountOut.toString(),
    baseAssetDecimals
  );

  return amountOutBN;
}
