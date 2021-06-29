import React, { ReactElement, useCallback, useMemo } from "react";

import { Web3Provider } from "@ethersproject/providers";
import { BigNumber } from "ethers";
import { formatEther, parseUnits } from "ethers/lib/utils";
import { t } from "ttag";

import { SwapKind } from "efi-balancer/SwapKind";
import { getBalancerApprovalMessage } from "efi-ui/balancer/balancerApprovalMessage";
import { useBalancerVault } from "efi-ui/balancer/useBalancerVault";
import { parseQueryBatchSwapResult } from "efi-ui/balancer/useQueryBatchSwap/parseQueryBatchSwapResult";
import { useQueryBatchSwap } from "efi-ui/balancer/useQueryBatchSwap/useQueryBatchSwap";
import { useSwap } from "efi-ui/balancer/useSwap/useSwap";
import { usePoolSwapFee } from "efi-ui/pools/usePoolSwapFee/usePoolSwapFee";
import { useSigner } from "efi-ui/provider/useBlockFromTag/useSigner/useSigner";
import { SwapDetailsForm } from "efi-ui/swaps/SwapDetailsPreview/SwapDetailsForm";
import { SwapTokenDetails } from "efi-ui/swaps/SwapTokensTransactionConfirmationDrawer/SwapTokensDetails";
import { IconProps } from "efi-ui/token/TokenIcon";
import { TransactionDrawer } from "efi-ui/transactions/TransactionDrawer/TransactionDrawer";
import { CryptoAsset, CryptoAssetType } from "efi/crypto/CryptoAsset";
import { getCryptoAssetForToken } from "efi/crypto/getCryptoAssetForToken";
import { getCryptoSymbol } from "efi/crypto/getCryptoSymbol";
import { getPoolContract } from "efi/pools/getPoolContract";
import { getPoolTokens } from "efi/pools/getPoolTokens";
import { isConvergentCurvePool } from "efi/pools/PoolContract";
import { PoolInfo } from "efi/pools/PoolInfo";
import { getToleranceAmount } from "efi/trade/getToleranceAmount";
import { TermAssetType } from "efi/tranche/TermAssetType";

interface SwapTokensTransactionConfirmationDrawerProps {
  account: string | null | undefined;
  library: Web3Provider | undefined;
  poolInfo: PoolInfo;

  buttonLabel?: string;

  amountIn: string;
  amountOut: string;
  swapKind: SwapKind;
  tokenInAsset: CryptoAsset;
  tokenInAddress: string;
  tokenInSymbol: string;
  tokenInDecimals: number;
  tokenInIcon: React.FC<IconProps> | undefined;
  tokenOutAddress: string;
  tokenOutSymbol: string;
  tokenOutDecimals: number;
  tokenOutIcon: React.FC<IconProps> | undefined;

  // out/in
  spotPrice: number | undefined;

  isOpen: boolean;

  onClose: () => void;
}

export function SwapTokensTransactionConfirmationDrawer({
  library,
  account,
  tokenInAsset,
  tokenInAddress,
  tokenInSymbol,
  tokenInDecimals,
  tokenInIcon,
  tokenOutAddress,
  tokenOutSymbol,
  tokenOutDecimals,
  tokenOutIcon,
  buttonLabel = t`Trade`,
  spotPrice,
  amountIn,
  amountOut,
  swapKind,
  isOpen,
  onClose,
  poolInfo,
}: SwapTokensTransactionConfirmationDrawerProps): ReactElement {
  const signer = useSigner(account, library);
  const balancerVault = useBalancerVault();

  const {
    address: poolAddress,
    extensions: { poolId },
  } = poolInfo;
  const pool = getPoolContract(poolAddress);
  const {
    baseAssetContract,
    termAssetInfo: { address: termAssetAddress },
  } = getPoolTokens(poolInfo);
  const baseAsset = getCryptoAssetForToken(baseAssetContract?.address);
  const baseAssetSymbol = getCryptoSymbol(baseAsset);
  const baseAssetIn = termAssetAddress !== tokenInAddress;

  const termAssetType: TermAssetType = isConvergentCurvePool(pool)
    ? "principal"
    : "yield";

  // pool calls
  const amountInBN = parseUnits(amountIn || "0", tokenInDecimals);
  const { data: queryBatchSwapInResult = [] } = useQueryBatchSwap(
    swapKind,
    pool,
    tokenInAddress,
    tokenOutAddress,
    amountInBN
  );

  const priceImpact = getPriceImpact(
    amountIn,
    amountOut,
    spotPrice,
    baseAssetIn
  );

  const {
    tokenOut: queryAmountOut = BigNumber.from(0),
    tokenIn: queryAmountIn = BigNumber.from(0),
  } = parseQueryBatchSwapResult(
    tokenInAddress,
    tokenOutAddress,
    queryBatchSwapInResult
  );

  const slippageTolerance = termAssetType === "principal" ? 0.003 : 0.01;

  const amountToLimit =
    swapKind === SwapKind.GIVEN_IN ? queryAmountOut.abs() : queryAmountIn.abs();
  const limitBN = getToleranceAmount(
    amountToLimit,
    swapKind,
    slippageTolerance,
    tokenInDecimals,
    tokenOutDecimals
  );

  const { swap: onConfirmSwapTokens, mutationResult: swapResult } = useSwap(
    account,
    signer,
    poolId,
    tokenInAddress,
    tokenOutAddress,
    amountInBN,
    limitBN,
    swapKind,
    onClose
  );

  const { isLoading, isError, isSuccess, reset, error } = swapResult;

  const feePercentBN = usePoolSwapFee(poolInfo);
  const feePercent = +formatEther(feePercentBN ?? 0);
  let appliedFeePercent = feePercent;
  if (isConvergentCurvePool(pool) && spotPrice) {
    // CCPools apply the fee perent to the difference in price between the two assets
    appliedFeePercent = feePercent * Math.abs(1 - spotPrice);
  }

  const resetSwap = useCallback(() => {
    reset();
    onClose();
  }, [onClose, reset]);

  const walletApprovalInfos = useWalletApprovalInfos(
    tokenInAsset,
    account,
    balancerVault?.address
  );

  return (
    <TransactionDrawer
      isOpen={isOpen}
      onClose={resetSwap}
      account={account}
      library={library}
      onConfirmTransaction={onConfirmSwapTokens}
      buttonLabel={buttonLabel}
      walletApprovalInfos={walletApprovalInfos}
      transactionPending={isLoading}
      transactionFailed={isError}
      transactionError={error as Error | undefined}
      transactionSuccess={isSuccess}
      transactionDetails={
        <SwapDetailsForm
          amountIn={amountIn}
          amountOut={amountOut}
          assetInIcon={tokenInIcon}
          assetOutIcon={tokenOutIcon}
          assetInSymbol={tokenInSymbol}
          assetOutSymbol={tokenOutSymbol}
        >
          <SwapTokenDetails
            baseAssetSymbol={baseAssetSymbol}
            priceImpact={priceImpact}
            feePercent={appliedFeePercent}
            slippageTolerance={slippageTolerance}
            spotPriceBaseAssetForOneToken={spotPrice}
            termAssetType={termAssetType}
          />
        </SwapDetailsForm>
      }
    />
  );
}

export function getPriceImpact(
  amountIn: string,
  amountOut: string,
  spotPriceToken: number | undefined = 0,
  baseAssetIn: boolean
): number {
  // spotPriceToken is baseAssetIn / termAssetOut, so if we are trading termAssetIn, we need to flip
  // the spot price so that it is termAssetIn / baseAssetOut so that it lines up with the purchase
  // price calc of amountIn / amountOut:
  const spotPriceBaseAsset = 1 / (spotPriceToken || 1);
  const spotPrice = baseAssetIn ? spotPriceToken : spotPriceBaseAsset;

  const purchasePrice = +amountIn / +amountOut;

  const ratioOfPrices = purchasePrice / spotPrice;

  // we don't care if the ratio is 1.01 or 0.99, just that the percent difference is 1%
  const priceImpact = Math.abs(1 - ratioOfPrices);
  return priceImpact;
}

function useWalletApprovalInfos(
  tokenInAsset: CryptoAsset | undefined,
  account: string | null | undefined,
  balancerVaultAddress: string | undefined
) {
  return useMemo(() => {
    if (!tokenInAsset || tokenInAsset.type === CryptoAssetType.ETHEREUM) {
      return;
    }
    return [
      {
        cryptoAsset: tokenInAsset,
        ownerAddress: account,
        spenderAddress: balancerVaultAddress,
        messageRenderer: getBalancerApprovalMessage,
      },
    ];
  }, [account, tokenInAsset, balancerVaultAddress]);
}
