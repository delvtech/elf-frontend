import { Fragment, ReactElement, useCallback, useState } from "react";

import { Button, Intent, Tag } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { ConvergentCurvePool } from "elf-contracts/types";
import { formatUnits } from "ethers/lib/utils";
import { PrincipalPoolTokenInfo, PrincipalTokenInfo } from "tokenlists/types";
import { t } from "ttag";

import { BALANCER_POOL_LP_TOKEN_DECIMALS } from "efi-balancer/pools";
import tw from "efi-tailwindcss-classnames";
import { SwapKind } from "efi-ui/balancer/SwapKind";
import { getCalcSwap } from "efi-ui/balancer/useQueryBatchSwap/useQueryBatchSwap";
import { useNumericInput } from "efi-ui/base/hooks/useNumericInput/useNumericInput";
import { findAssetIcon2 } from "efi-ui/crypto/CryptoIcon";
import { usePoolSpotPrice2 } from "efi-ui/pools/usePoolSpotPrice/usePoolSpotPrice";
import { usePoolTokens } from "efi-ui/pools/usePoolTokens/usePoolTokens";
import { usePoolTotalSupply } from "efi-ui/pools/usePoolTotalSupply";
import { SwapTokensTransactionConfirmationDrawer } from "efi-ui/swaps/SwapTokensTransactionConfirmationDrawer/SwapTokensTransactionConfirmationDrawer";
import { useTokenBalanceOf } from "efi-ui/token/hooks/useTokenBalanceOf";
import { TokenAmountInput } from "efi-ui/token/TokenAmountInput/TokenAmountInput";
import { formatBalance } from "efi/base/formatBalance";
import { clipStringValueToDecimals } from "efi/base/math/fixedPoint";
import { getCryptoAssetForToken } from "efi/crypto/getCryptoAssetForToken";
import { getCryptoDecimals } from "efi/crypto/getCryptoDecimals";
import { getCryptoSymbol } from "efi/crypto/getCryptoSymbol";
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
    library,
    account,
    principalToken: {
      address: ptAddress,
      decimals: ptDecimals,
      symbol: ptSymbol,
      extensions: { underlying: underlyingAddress },
    },
  } = props;
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const { stringValue: amountIn, setValue: onAmountInChange } =
    useNumericInput();
  const closeDrawer = useCallback(() => {
    onAmountInChange("");
    setDrawerOpen(false);
  }, [onAmountInChange]);

  // base asset
  const baseAsset = getBaseAssetForTranche(ptAddress);
  const baseAssetIcon = findAssetIcon2(baseAsset);
  const baseAssetSymbol = getCryptoSymbol(baseAsset);
  const baseAssetDecimals = getCryptoDecimals(baseAsset);

  // principal token
  const trancheContract = trancheContractsByAddress[ptAddress];
  const { data: ptBalanceOf } = useTokenBalanceOf(trancheContract, account);
  const ptBalanceLabel = formatBalance(ptBalanceOf, ptDecimals, ptDecimals);
  const principalTokenCryptoAsset = getCryptoAssetForToken(ptAddress);
  const ptIcon = findAssetIcon2(principalTokenCryptoAsset);

  // inputs
  const poolInfo = getPrincipalPoolForTranche(ptAddress);
  const { tokenOutError, tokenInError } = useValidateInput(
    account,
    poolInfo,
    amountIn
  );
  const previewAmountOut = useCalculateUnderlyingTokenOut(poolInfo, amountIn);
  const poolContract = getPoolContract(poolInfo.address) as ConvergentCurvePool;
  const spotPrice = usePoolSpotPrice2(poolContract, underlyingAddress);

  const buttonDisabled = !!tokenInError || !!tokenOutError || !amountIn;
  let buttonIntent: Intent = Intent.PRIMARY;
  if (tokenInError || tokenOutError) {
    buttonIntent = Intent.DANGER;
  }

  return (
    <Fragment>
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
              value={amountIn}
              maxAmount={ptBalanceOf}
              tokenDecimals={ptDecimals}
              onValueChange={onAmountInChange}
            />
            <div>
              <Button
                fill
                disabled={buttonDisabled}
                outlined
                large
                intent={buttonIntent}
                onClick={openDrawer}
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
      <SwapTokensTransactionConfirmationDrawer
        buttonLabel={t`Sell`}
        tokenInAddress={ptAddress}
        tokenInSymbol={ptSymbol}
        tokenInDecimals={ptDecimals}
        tokenInAsset={principalTokenCryptoAsset}
        tokenInIcon={ptIcon}
        tokenOutAddress={underlyingAddress}
        tokenOutSymbol={baseAssetSymbol}
        tokenOutDecimals={baseAssetDecimals}
        tokenOutIcon={baseAssetIcon}
        account={account}
        library={library}
        pool={poolContract}
        amountIn={amountIn}
        amountOut={previewAmountOut}
        swapKind={SwapKind.GIVEN_IN}
        spotPrice={spotPrice}
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
      />
    </Fragment>
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
    extensions: { bond, underlying },
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

  const { result: [, amountOut] = [] } = getCalcSwap(
    amountIn,
    SwapKind.GIVEN_IN,
    poolInfo,
    bond,
    underlying,
    principalReserves,
    underlyingReserves,
    totalSupply
  );

  return clipStringValueToDecimals(amountOut?.toString(), baseAssetDecimals);
}
