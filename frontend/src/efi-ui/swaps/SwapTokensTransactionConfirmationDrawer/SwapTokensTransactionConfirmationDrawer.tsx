import React, { ReactElement } from "react";

import { Web3Provider } from "@ethersproject/providers";
import { AbstractConnector } from "@web3-react/abstract-connector";
import { Signer } from "ethers";
import { formatUnits, parseUnits } from "ethers/lib/utils";

import { getBalancerApprovalMessage } from "efi-ui/balancer/balancerApprovalMessage";
import { SwapKind } from "efi-ui/balancer/SwapKind";
import { useBalancerVault } from "efi-ui/balancer/useBalancerVault";
import { useBatchSwapGivenIn } from "efi-ui/balancer/useBatchSwapGivenIn/useBatchSwapGivenIn";
import { parseQueryBatchSwapResult } from "efi-ui/balancer/useQueryBatchSwap/parseQueryBatchSwapResult";
import { useQueryBatchSwap } from "efi-ui/balancer/useQueryBatchSwap/useQueryBatchSwap";
import { SwapDetailsForm } from "efi-ui/swaps/SwapDetailsPreview/SwapDetailsForm";
import { SwapTokenDetails } from "efi-ui/swaps/SwapTokensTransactionConfirmationDrawer/SwapTokensDetails";
import { TokenIcon } from "efi-ui/token/TokenIcon";
import { TransactionDrawer } from "efi-ui/transactions/TransactionDrawer/TransactionDrawer";
import { CryptoAsset } from "efi/crypto/CryptoAsset";
import { calculatePurchasePrice } from "efi/pools/calculatePurchasePrice";
import { calculateSlippage } from "efi/pools/calculateSlippage";
import { PoolContract } from "efi/pools/PoolContract";
import { getAmountOutWithTolerance } from "efi/trade/getAmountOutWithTolerance";

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

  const onConfirmSwapTokens = useBatchSwapGivenIn(
    account,
    signer,
    pool,
    tokenInAddress,
    tokenOutAddress,
    amountInAsBigNumber,
    minAmountOut
  );

  const amountOutNumber = +formatUnits(amountOut?.abs() || 0, tokenInDecimals);
  console.log("amountIn", amountIn);
  console.log("amountOutNumber", amountOutNumber);
  const amountOutFormatted = amountOutNumber.toFixed(4);

  console.log("spotPrice", spotPrice);
  const priceSlippageAndTradingFee = getPriceSlippageAndTradingFee(
    +(amountIn || 0),
    amountOutNumber,
    1 / (spotPrice || 1)
  );

  return (
    <TransactionDrawer
      approvalSpenderAddress={balancerVault?.address}
      isOpen={isOpen}
      onClose={onClose}
      account={account}
      assetIn={tokenInAsset}
      assetInSymbol={tokenInSymbol}
      walletConnectionActive={walletConnectionActive}
      amountIn={amountInAsBigNumber}
      chainId={chainId}
      connector={connector}
      library={library}
      onConfirmTransaction={onConfirmSwapTokens}
      walletApprovalMessageRenderer={getBalancerApprovalMessage}
      transactionDetails={
        <SwapDetailsForm
          amountIn={amountIn}
          amountOut={amountOutFormatted}
          assetInIcon={tokenInIcon}
          assetInSymbol={tokenInSymbol}
          assetOutSymbol={`${tokenInSymbol} Principal Token`}
        >
          <SwapTokenDetails
            baseAssetSymbol={tokenInSymbol}
            priceSlippageAndTradingFee={priceSlippageAndTradingFee}
            spotPriceBaseAssetForOneToken={spotPrice}
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
