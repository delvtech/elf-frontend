import { ReactElement, useCallback, useMemo } from "react";

import { Web3Provider } from "@ethersproject/providers";
import { Tranche } from "elf-contracts/types/Tranche";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { t } from "ttag";

import { getBalancerApprovalMessage } from "efi-ui/balancer/balancerApprovalMessage";
import { SwapKind } from "efi/balancer/SwapKind";
import { useBalancerVault } from "efi-ui/balancer/useBalancerVault";
import { useBatchSwapGivenIn } from "efi-ui/balancer/useBatchSwapGivenIn/useBatchSwapGivenIn";
import { parseQueryBatchSwapResult } from "efi-ui/balancer/useQueryBatchSwap/parseQueryBatchSwapResult";
import { useQueryBatchSwap } from "efi-ui/balancer/useQueryBatchSwap/useQueryBatchSwap";
import { getCryptoDecimals } from "efi/crypto/getCryptoDecimals";
import { getCryptoSymbol } from "efi/crypto/getCryptoSymbol";
import { usePoolTokenPrices } from "efi-ui/pools/usePoolTokenPrices/usePoolTokenPrices";
import { getTokenAddressForBalancer } from "efi-ui/swaps/getTokenAddressForBalancer";
import { PrincipalTokenTransactionDetails } from "efi-ui/swaps/PrincipalTokenTransactionDetails/PrincipalTokenTransactionDetails";
import { SwapDetailsForm } from "efi-ui/swaps/SwapDetailsPreview/SwapDetailsForm";
import { TokenIcon } from "efi-ui/token/TokenIcon";
import { TransactionDrawer } from "efi-ui/transactions/TransactionDrawer/TransactionDrawer";
import { convertEpochSecondsToDate2 } from "efi/base/convertEpochSecondsToDate";
import { CryptoAsset, CryptoAssetType } from "efi/crypto/CryptoAsset";
import { calculatePurchasePrice } from "efi/pools/calculatePurchasePrice";
import { calculateSlippage } from "efi/pools/calculateSlippage";
import { PoolContract } from "efi/pools/PoolContract";
import { getToleranceAmount } from "efi/trade/getToleranceAmount";
import { useSigner } from "efi-ui/provider/useBlockFromTag/useSigner/useSigner";
import { getTokenInfo } from "efi/tokenlists";
import { PrincipalTokenInfo } from "tokenlists/types";
import { underlyingContractsByAddress } from "efi/underlying/underlying";
import { BigNumber } from "ethers";

interface BuyPrincipalTransactionConfirmationDrawerProps {
  account: string | null | undefined;
  library: Web3Provider | undefined;
  pool: PoolContract | undefined;

  amountIn: string | undefined;
  amountOut: string | undefined;
  swapKind: SwapKind;

  baseAsset: CryptoAsset;
  baseAssetIcon: TokenIcon | undefined;

  tranche: Tranche;
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
  const baseAssetDecimals = getCryptoDecimals(baseAsset) ?? 18;

  // tranche calls
  const {
    extensions: { unlockTimestamp: trancheUnlockTimestamp, underlying },
  } = getTokenInfo<PrincipalTokenInfo>(tranche.address);

  const unlockTimeStampDate = convertEpochSecondsToDate2(
    trancheUnlockTimestamp
  );

  const baseAssetPoolToken = underlyingContractsByAddress[underlying];

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
  const { tokenOut: queryAmountOut = BigNumber.from(0) } =
    parseQueryBatchSwapResult(
      tokenInAddress,
      tokenOutAddress,
      queryBatchSwapInResult
    );

  const minAmountOut = getToleranceAmount(
    queryAmountOut.abs(),
    SwapKind.GIVEN_IN,
    0.01,
    baseAssetDecimals,
    baseAssetDecimals
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
