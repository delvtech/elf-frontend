import React, { ReactElement, useCallback, useMemo } from "react";

import { Web3Provider } from "@ethersproject/providers";
import { AbstractConnector } from "@web3-react/abstract-connector";
import { Signer } from "ethers";
import { formatEther, formatUnits, parseUnits } from "ethers/lib/utils";
import { t } from "ttag";

import { getBalancerApprovalMessage } from "efi-ui/balancer/balancerApprovalMessage";
import { SwapKind } from "efi-ui/balancer/SwapKind";
import { useBalancerVault } from "efi-ui/balancer/useBalancerVault";
import { useBatchSwapGivenIn } from "efi-ui/balancer/useBatchSwapGivenIn/useBatchSwapGivenIn";
import { parseQueryBatchSwapResult } from "efi-ui/balancer/useQueryBatchSwap/parseQueryBatchSwapResult";
import { useQueryBatchSwap } from "efi-ui/balancer/useQueryBatchSwap/useQueryBatchSwap";
import { useCryptoAddress } from "efi-ui/crypto/hooks/useCryptoAddress/useCryptoAddress";
import { getCryptoAssetForToken } from "efi/crypto/getCryptoAssetForToken";
import { useCryptoSymbol } from "efi-ui/crypto/hooks/useCryptoSymbol/useCryptoSymbol";
import { useBaseAssetForPool } from "efi-ui/pools/useBaseAssetForPool/useBaseAssetForPool";
import { usePoolSwapFee } from "efi-ui/pools/usePoolSwapFee/usePoolSwapFee";
import { SwapDetailsForm } from "efi-ui/swaps/SwapDetailsPreview/SwapDetailsForm";
import { SwapTokenDetails } from "efi-ui/swaps/SwapTokensTransactionConfirmationDrawer/SwapTokensDetails";
import { TokenIcon } from "efi-ui/token/TokenIcon";
import { TransactionDrawer } from "efi-ui/transactions/TransactionDrawer/TransactionDrawer";
import { CryptoAsset, CryptoAssetType } from "efi/crypto/CryptoAsset";
import { calculatePurchasePrice } from "efi/pools/calculatePurchasePrice";
import { calculateSlippage } from "efi/pools/calculateSlippage";
import { isConvergentCurvePool, PoolContract } from "efi/pools/PoolContract";
import { getAmountOutWithTolerance } from "efi/trade/getAmountOutWithTolerance";
import { TermAssetType } from "efi/tranche/TermAssetType";

interface SwapTokensTransactionConfirmationDrawerProps {
  chainId: number | undefined;
  account: string | null | undefined;
  walletConnectionActive: boolean;
  connector: AbstractConnector | undefined;
  library: Web3Provider | undefined;
  pool: PoolContract | undefined;

  amountIn: string | undefined;
  tokenInAsset: CryptoAsset | undefined;
  tokenInAddress: string | undefined;
  tokenInSymbol: string | undefined;
  tokenInDecimals: number | undefined;
  tokenInIcon: TokenIcon | undefined;
  tokenOutAddress: string | undefined;
  tokenOutSymbol: string | undefined;
  tokenOutDecimals: number | undefined;
  tokenOutIcon: TokenIcon | undefined;

  // out/in
  spotPrice: number | undefined;

  isOpen: boolean;

  onClose: () => void;
}

export function SwapTokensTransactionConfirmationDrawer({
  connector,
  walletConnectionActive,
  library,
  chainId,
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
  spotPrice,
  amountIn,
  isOpen,
  onClose,
  pool,
}: SwapTokensTransactionConfirmationDrawerProps): ReactElement {
  const signer = account ? (library?.getSigner(account) as Signer) : undefined;
  const balancerVault = useBalancerVault();

  const baseAssetContract = useBaseAssetForPool(pool);
  const baseAsset = getCryptoAssetForToken(baseAssetContract?.address);
  const baseAssetSymbol = useCryptoSymbol(baseAsset);
  const baseAssetAddress = useCryptoAddress(baseAsset);
  const baseAssetIn = baseAssetAddress === tokenInAddress;

  const termAssetType: TermAssetType = isConvergentCurvePool(pool)
    ? "principal"
    : "yield";

  // pool calls
  const amountInAsBigNumber = parseUnits(amountIn || "0", tokenInDecimals);
  const { data: queryBatchSwapInResult = [] } = useQueryBatchSwap(
    SwapKind.GIVEN_IN,
    pool,
    tokenInAddress,
    tokenOutAddress,
    amountInAsBigNumber
  );
  const { tokenOut: amountOut } = parseQueryBatchSwapResult(
    tokenInAddress,
    tokenOutAddress,
    queryBatchSwapInResult
  );

  const minAmountOut = getAmountOutWithTolerance(
    amountOut,
    tokenOutDecimals,
    0.01
  );

  const { batchSwapGivenIn: onConfirmSwapTokens, mutationResult: swapResult } =
    useBatchSwapGivenIn(
      account,
      signer,
      pool,
      tokenInAddress,
      tokenOutAddress,
      amountInAsBigNumber,
      minAmountOut,
      onClose
    );

  const { isLoading, isError, isSuccess, reset } = swapResult;

  const amountOutNumber = +formatUnits(amountOut?.abs() || 0, tokenInDecimals);
  const amountOutFormatted = amountOutNumber.toFixed(4);

  // spotPrice is yield out / base in.  So, if the base asset is the output, we need to flip the
  // spotPrice so it'll match the purchasePrice.
  const spotPriceInOut = baseAssetIn ? 1 / (spotPrice || 0) : spotPrice;
  const priceSlippage = getPriceSlippageAndTradingFee(
    +(amountIn || 0),
    amountOutNumber,
    spotPriceInOut
  );

  const feePercentBN = usePoolSwapFee(pool);
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
      buttonLabel={t`Trade`}
      walletApprovalInfos={walletApprovalInfos}
      transactionPending={isLoading}
      transactionFailed={isError}
      transactionSuccess={isSuccess}
      transactionDetails={
        <SwapDetailsForm
          amountIn={amountIn}
          amountOut={amountOutFormatted}
          assetInIcon={tokenInIcon}
          assetInSymbol={tokenInSymbol}
          assetOutSymbol={tokenOutSymbol}
        >
          <SwapTokenDetails
            baseAssetSymbol={baseAssetSymbol}
            priceSlippage={priceSlippage}
            feePercent={appliedFeePercent}
            spotPriceBaseAssetForOneToken={spotPrice}
            termAssetType={termAssetType}
          />
        </SwapDetailsForm>
      }
    />
  );
}
function getPriceSlippageAndTradingFee(
  amountIn: number,
  amountOutNumber: number,
  spotPriceTokenForOneBaseAsset: number | undefined
) {
  const amountInNumber = +(amountIn || 0);
  const purchasePrice = calculatePurchasePrice(amountOutNumber, amountInNumber);
  const priceSlippageAndTradingFee = calculateSlippage(
    spotPriceTokenForOneBaseAsset || 0,
    purchasePrice
  );
  return priceSlippageAndTradingFee;
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
