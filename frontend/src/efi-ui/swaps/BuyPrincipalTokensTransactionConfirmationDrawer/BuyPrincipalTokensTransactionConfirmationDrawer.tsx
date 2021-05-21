import { ReactElement, useCallback, useMemo, useState } from "react";

import { Web3Provider } from "@ethersproject/providers";
import { Tranche } from "elf-contracts/types/Tranche";
import { Signer } from "ethers";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { t } from "ttag";

import { getBalancerApprovalMessage } from "efi-ui/balancer/balancerApprovalMessage";
import { SwapKind } from "efi-ui/balancer/SwapKind";
import { useBalancerVault } from "efi-ui/balancer/useBalancerVault";
import { useBatchSwapGivenIn } from "efi-ui/balancer/useBatchSwapGivenIn/useBatchSwapGivenIn";
import { parseQueryBatchSwapResult } from "efi-ui/balancer/useQueryBatchSwap/parseQueryBatchSwapResult";
import { useQueryBatchSwap } from "efi-ui/balancer/useQueryBatchSwap/useQueryBatchSwap";
import { ERC20Shim } from "efi/contracts/ERC20Shim";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { getCryptoDecimals } from "efi/crypto/getCryptoDecimals";
import { getCryptoSymbol } from "efi/crypto/getCryptoSymbol";
import { usePoolPairedToken } from "efi-ui/pools/usePoolPairedToken/usePoolPairedToken";
import { usePoolTokenPrices } from "efi-ui/pools/usePoolTokenPrices/usePoolTokenPrices";
import { getTokenAddressForBalancer } from "efi-ui/swaps/getTokenAddressForBalancer";
import { PrincipalTokenTransactionDetails } from "efi-ui/swaps/PrincipalTokenTransactionDetails/PrincipalTokenTransactionDetails";
import { SwapDetailsForm } from "efi-ui/swaps/SwapDetailsPreview/SwapDetailsForm";
import { TokenIcon } from "efi-ui/token/TokenIcon";
import { TransactionDrawer } from "efi-ui/transactions/TransactionDrawer/TransactionDrawer";
import { convertEpochSecondsToDate } from "efi/base/convertEpochSecondsToDate";
import { CryptoAsset, CryptoAssetType } from "efi/crypto/CryptoAsset";
import { calculatePurchasePrice } from "efi/pools/calculatePurchasePrice";
import { calculateSlippage } from "efi/pools/calculateSlippage";
import { PoolContract } from "efi/pools/PoolContract";
import { getAmountOutWithTolerance } from "efi/trade/getAmountOutWithTolerance";
import { useSigner } from "efi-ui/provider/useBlockFromTag/useSigner/useSigner";

interface BuyPrincipalTransactionConfirmationDrawerProps {
  account: string | null | undefined;
  library: Web3Provider | undefined;
  pool: PoolContract | undefined;

  amountIn: string | undefined;
  amountOut: string | undefined;
  swapKind: SwapKind;

  baseAsset: CryptoAsset;
  baseAssetIcon: TokenIcon | undefined;

  tranche: Tranche | undefined;
  isOpen: boolean;

  onClose: (transactionAttempted: boolean) => void;
}

export function BuyPrincipalTokensTransactionConfirmationDrawer({
  library,
  account,
  baseAssetIcon,
  baseAsset,
  tranche,
  amountIn,
  amountOut,
  swapKind,
  isOpen,
  onClose,
  pool,
}: BuyPrincipalTransactionConfirmationDrawerProps): ReactElement {
  const signer = useSigner(account, library);
  const onCloseWithoutTransaction = useCallback(
    () => onClose(false),
    [onClose]
  );
  const onCloseWithTransaction = useCallback(() => onClose(true), [onClose]);

  const balancerVault = useBalancerVault();
  // base asset calls
  const baseAssetSymbol = getCryptoSymbol(baseAsset);
  const baseAssetDecimals = getCryptoDecimals(baseAsset);

  // tranche calls
  const { data: trancheUnlockTimestamp } = useSmartContractReadCall(
    tranche,
    "unlockTimestamp"
  );
  const unlockTimeStampDate = convertEpochSecondsToDate(trancheUnlockTimestamp);

  const baseAssetPoolToken = usePoolPairedToken(pool, tranche as ERC20Shim);
  const { spotPriceBaseAssetForOneToken, spotPriceTokenForOneBaseAsset } =
    usePoolTokenPrices(pool, baseAssetPoolToken);

  // pool calls
  const amountInAsBigNumber = parseUnits(amountIn || "0", baseAssetDecimals);
  const tokenInAddress = getTokenAddressForBalancer(baseAsset);
  const tokenOutAddress = tranche?.address;
  const { data: queryBatchSwapInResult = [] } = useQueryBatchSwap(
    swapKind,
    pool,
    tokenInAddress,
    tokenOutAddress,
    amountInAsBigNumber
  );
  const { tokenOut: queryAmountOut } = parseQueryBatchSwapResult(
    tokenInAddress,
    tokenOutAddress,
    queryBatchSwapInResult
  );

  const minAmountOut = getAmountOutWithTolerance(
    queryAmountOut,
    baseAssetDecimals,
    0.01
  );

  const {
    batchSwapGivenIn: onConfirmBuyPrincipalTokens,
    mutationResult: { isLoading, isSuccess, isError },
  } = useBatchSwapGivenIn(
    account,
    signer,
    pool,
    tokenInAddress,
    tranche?.address,
    amountInAsBigNumber,
    minAmountOut,
    onCloseWithTransaction
  );

  const amountOutNumber = +formatUnits(
    queryAmountOut?.abs() || 0,
    baseAssetDecimals
  );

  const priceSlippageAndTradingFee = getPriceSlippageAndTradingFee(
    +(amountIn || 0),
    amountOutNumber,
    spotPriceTokenForOneBaseAsset
  );

  const walletApprovalInfos = useWalletApprovalInfos(
    baseAsset,
    account,
    balancerVault?.address
  );

  return (
    <TransactionDrawer
      buttonLabel={t`Buy`}
      transactionPending={isLoading}
      transactionFailed={isError}
      transactionSuccess={isSuccess}
      isOpen={isOpen}
      onClose={onCloseWithoutTransaction}
      account={account}
      walletApprovalInfos={walletApprovalInfos}
      library={library}
      onConfirmTransaction={onConfirmBuyPrincipalTokens}
      transactionDetails={
        <SwapDetailsForm
          amountIn={amountIn}
          amountOut={amountOut}
          assetInIcon={baseAssetIcon}
          assetInSymbol={baseAssetSymbol}
          assetOutSymbol={`${baseAssetSymbol} Principal Token`}
          assetOutIcon={null}
        >
          <PrincipalTokenTransactionDetails
            spotPriceBaseAssetForOneToken={spotPriceBaseAssetForOneToken}
            baseAssetSymbol={baseAssetSymbol}
            unlockTimeStamp={unlockTimeStampDate}
            priceSlippageAndTradingFee={priceSlippageAndTradingFee}
          />
        </SwapDetailsForm>
      }
    />
  );
}
function useWalletApprovalInfos(
  baseAsset: CryptoAsset,
  account: string | null | undefined,
  vaultAddress: string | undefined
) {
  return useMemo(
    () =>
      baseAsset.type === CryptoAssetType.ETHEREUM
        ? undefined
        : [
            {
              cryptoAsset: baseAsset,
              ownerAddress: account,
              spenderAddress: vaultAddress,
              messageRenderer: getBalancerApprovalMessage,
            },
          ],
    [account, baseAsset, vaultAddress]
  );
}

function getPriceSlippageAndTradingFee(
  amountIn: number,
  amountOutNumber: number,
  spotPriceTokenForOneBaseAsset: number | undefined
) {
  const amountInNumber = +(amountIn || 0);
  const purchasePrice = calculatePurchasePrice(amountInNumber, amountOutNumber);
  const priceSlippageAndTradingFee = calculateSlippage(
    spotPriceTokenForOneBaseAsset || 0,
    purchasePrice
  );
  return priceSlippageAndTradingFee;
}
