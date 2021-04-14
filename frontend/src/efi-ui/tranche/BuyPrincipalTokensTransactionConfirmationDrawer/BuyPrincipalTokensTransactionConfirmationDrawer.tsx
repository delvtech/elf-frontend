import React, { FC } from "react";

import { Web3Provider } from "@ethersproject/providers";
import { AbstractConnector } from "@web3-react/abstract-connector";
import { Tranche } from "elf-contracts/types/Tranche";
import { Signer } from "ethers";
import { formatUnits, parseUnits } from "ethers/lib/utils";

import { getBalancerApprovalMessage } from "efi-ui/balancer/balancerApprovalMessage";
import { SwapKind } from "efi-ui/balancer/SwapKind";
import { useBalancerVault } from "efi-ui/balancer/useBalancerVault";
import { useBatchSwapGivenIn } from "efi-ui/balancer/useBatchSwapGivenIn/useBatchSwapGivenIn";
import { parseQueryBatchSwapResult } from "efi-ui/balancer/useQueryBatchSwap/parseQueryBatchSwapResult";
import { useQueryBatchSwap } from "efi-ui/balancer/useQueryBatchSwap/useQueryBatchSwap";
import { ERC20Shim } from "efi-ui/contracts/ERC20Shim";
import { SwapDetailsForm } from "efi-ui/swaps/TransactionDetailsPreview/SwapDetailsForm";
import { TransactionDrawer } from "efi-ui/contracts/TransactionDrawer/TransactionDrawer";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { CryptoAssetWithIcon } from "efi-ui/crypto/CryptoAssetWithIcon";
import { useCryptoDecimals } from "efi-ui/crypto/hooks/useCryptoDecimals/useCryptoDecimals";
import { useCryptoSymbol } from "efi-ui/crypto/hooks/useCryptoSymbol/useCryptoSymbol";
import { usePoolPairedToken } from "efi-ui/pools/usePoolPairedToken/usePoolPairedToken";
import { usePoolTokenPrices } from "efi-ui/pools/usePoolTokenPrices/usePoolTokenPrices";
import { getTokenAddressForBalancer } from "efi-ui/swaps/getTokenAddressForBalancer";
import { convertEpochSecondsToDate } from "efi/base/convertEpochSecondsToDate";
import { calculatePurchasePrice } from "efi/pools/calculatePurchasePrice";
import { calculateSlippage } from "efi/pools/calculateSlippage";
import { PoolContract } from "efi/pools/PoolContract";

import { PrincipalTokenTransactionDetails } from "../PrincipalTokenTransactionDetails/PrincipalTokenTransactionDetails";

interface BuyPrincipalTransactionConfirmationDrawerProps {
  chainId: number | undefined;
  account: string | null | undefined;
  walletConnectionActive: boolean;
  connector: AbstractConnector | undefined;
  library: Web3Provider | undefined;
  pool: PoolContract | undefined;

  amountIn: string | undefined;
  baseAsset: CryptoAssetWithIcon;

  tranche: Tranche | undefined;
  isOpen: boolean;

  onClose: () => void;
}

export const BuyPrincipalTokensTransactionConfirmationDrawer: FC<BuyPrincipalTransactionConfirmationDrawerProps> = ({
  connector,
  walletConnectionActive,
  library,
  chainId,
  account,
  baseAsset: { assetIcon: AssetIcon },
  baseAsset,
  tranche,
  amountIn,
  isOpen,
  onClose,
  pool,
}) => {
  const signer = account ? (library?.getSigner(account) as Signer) : undefined;
  const balancerVault = useBalancerVault();

  // base asset calls
  const baseAssetSymbol = useCryptoSymbol(baseAsset);
  const baseAssetDecimals = useCryptoDecimals(baseAsset);

  // tranche calls
  const { data: trancheUnlockTimestamp } = useSmartContractReadCall(
    tranche,
    "unlockTimestamp"
  );
  const unlockTimeStampDate = convertEpochSecondsToDate(trancheUnlockTimestamp);

  const baseAssetPoolToken = usePoolPairedToken(pool, tranche as ERC20Shim);
  const {
    spotPriceBaseAssetForOneToken,
    spotPriceTokenForOneBaseAsset,
  } = usePoolTokenPrices(pool, baseAssetPoolToken);

  // pool calls
  const amountInAsBigNumber = parseUnits(amountIn || "0", baseAssetDecimals);
  const tokenInAddress = getTokenAddressForBalancer(baseAsset);
  const tokenOutAddress = tranche?.address;
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

  const onConfirmBuyPrincipalTokens = useBatchSwapGivenIn(
    account,
    signer,
    pool,
    tokenInAddress,
    tranche?.address,
    amountInAsBigNumber
  );

  const amountOutNumber = +formatUnits(
    amountOut?.abs() || 0,
    baseAssetDecimals
  );
  const amountOutFormatted = amountOutNumber.toFixed(4);

  const priceSlippageAndTradingFee = getPriceSlippageAndTradingFee(
    +(amountIn || 0),
    amountOutNumber,
    spotPriceTokenForOneBaseAsset
  );

  return (
    <TransactionDrawer
      approvalSpenderAddress={balancerVault?.address}
      isOpen={isOpen}
      onClose={onClose}
      account={account}
      assetIn={baseAsset}
      assetInIcon={baseAsset.assetIcon}
      walletConnectionActive={walletConnectionActive}
      amountIn={amountInAsBigNumber}
      chainId={chainId}
      connector={connector}
      library={library}
      onConfirmTransaction={onConfirmBuyPrincipalTokens}
      walletApprovalMessageRenderer={getBalancerApprovalMessage}
      transactionDetails={
        <SwapDetailsForm
          amountIn={amountIn}
          amountOut={amountOutFormatted}
          assetInIcon={AssetIcon}
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
};
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
