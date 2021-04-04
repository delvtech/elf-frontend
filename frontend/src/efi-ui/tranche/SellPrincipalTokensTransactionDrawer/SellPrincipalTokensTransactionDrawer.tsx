import React, { FC } from "react";

import { Web3Provider } from "@ethersproject/providers";
import { AbstractConnector } from "@web3-react/abstract-connector";
import { Tranche } from "elf-contracts/types/Tranche";
import { Signer } from "ethers";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { t } from "ttag";

import { useBalancerTransactionInputs } from "efi-ui/balancer/useBalancerTransactionInputs";
import { useBatchSwapGivenIn } from "efi-ui/balancer/useBatchSwapGivenIn/useBatchSwapGivenIn";
import { ERC20Shim } from "efi-ui/contracts/ERC20Shim";
import { TransactionDetailsForm } from "efi-ui/contracts/TransactionDetailsPreview/TransactionDetailsForm";
import { TransactionDrawer } from "efi-ui/contracts/TransactionDrawer/TransactionDrawer";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { CryptoAssetWithIcon } from "efi-ui/crypto/CryptoAssetWithIcon";
import { useCryptoDecimals } from "efi-ui/crypto/hooks/useCryptoDecimals/useCryptoDecimals";
import { useCryptoSymbol } from "efi-ui/crypto/hooks/useCryptoSymbol/useCryptoSymbol";
import { usePoolPairedToken } from "efi-ui/pools/usePoolPairedToken/usePoolPairedToken";
import { usePoolTokenPrices } from "efi-ui/pools/usePoolTokenPrices/usePoolTokenPrices";
import { getTokenAddressForBalancer } from "efi-ui/swaps/getTokenAddressForBalancer";
import { PrincipalTokenTransactionDetails } from "efi-ui/tranche/PrincipalTokenTransactionDetails/PrincipalTokenTransactionDetails";
import { convertEpochSecondsToDate } from "efi/base/convertEpochSecondsToDate";
import { calculatePurchasePrice } from "efi/pools/calculatePurchasePrice";
import { calculateSlippage } from "efi/pools/calculateSlippage";
import { PoolContract } from "efi/pools/PoolContract";
import { CryptoAsset, CryptoAssetType } from "efi/crypto/CryptoAsset";
import { ERC20 } from "elf-contracts/types/ERC20";

interface SellPrincipalTransactionDrawerProps {
  chainId: number | undefined;
  account: string | null | undefined;
  walletConnectionActive: boolean;
  connector: AbstractConnector | undefined;
  library: Web3Provider | undefined;
  pool: PoolContract | undefined;
  baseAsset: CryptoAssetWithIcon;
  tranche: Tranche | undefined;
  isOpen: boolean;
  onClose: () => void;
}

export const SellPrincipalTokensTransactionDrawer: FC<SellPrincipalTransactionDrawerProps> = ({
  connector,
  walletConnectionActive,
  library,
  chainId,
  account,
  baseAsset: { assetIcon: AssetIcon },
  baseAsset,
  tranche,
  isOpen,
  onClose,
  pool,
}) => {
  const signer = account ? (library?.getSigner(account) as Signer) : undefined;

  // base asset calls
  const baseAssetSymbol = useCryptoSymbol(baseAsset);
  const baseAssetDecimals = useCryptoDecimals(baseAsset);

  // tranche calls
  const { data: trancheUnlockTimestamp } = useSmartContractReadCall(
    tranche,
    "unlockTimestamp"
  );
  const { data: trancheDecimals } = useSmartContractReadCall(
    tranche,
    "decimals"
  );
  const unlockTimeStampDate = convertEpochSecondsToDate(trancheUnlockTimestamp);

  // This might be weth in the case of eth, but that's okay for spot price
  const baseAssetPoolToken = usePoolPairedToken(pool, tranche as ERC20Shim);
  const {
    spotPriceBaseAssetForOneToken,
    spotPriceTokenForOneBaseAsset,
  } = usePoolTokenPrices(pool, baseAssetPoolToken);

  const trancheAddress = tranche?.address;
  const baseAssetBalancerAddress = getTokenAddressForBalancer(baseAsset);
  const {
    amountIn,
    amountOut,
    onAmountInChange,
    onAmountOutChange,
  } = useBalancerTransactionInputs(
    pool,
    trancheAddress,
    trancheDecimals,
    baseAssetBalancerAddress,
    baseAssetDecimals
  );

  // pool calls
  const amountInAsBigNumber = parseUnits(amountIn || "0", baseAssetDecimals);
  const amountOutAsBigNumber = parseUnits(amountOut || "0", trancheDecimals);

  const onConfirmSellPrincipalTokens = useBatchSwapGivenIn(
    account,
    signer,
    pool,
    tranche?.address,
    baseAssetBalancerAddress,
    amountInAsBigNumber
  );

  const amountOutNumber = +formatUnits(
    amountOutAsBigNumber?.abs() || 0,
    baseAssetDecimals
  );
  const amountOutFormatted =
    amountOutNumber === 0 ? "" : amountOutNumber.toFixed(4);

  const priceSlippageAndTradingFee = getPriceSlippageAndTradingFee(
    +(amountIn || 0),
    amountOutNumber,
    spotPriceTokenForOneBaseAsset
  );

  const assetIn = makeCryptoAsset(tranche as ERC20Shim);

  // We want InputGroup to be a controlled component, but passing `undefined` is
  // how you express an uncontrolled component. Having this change between
  // uncontrolled and controlled causes bugginess and big warnings in the
  // console, so we use empty string here to keep everything controlled.
  const safeAmountIn = amountIn === undefined ? "" : amountIn;

  return (
    <TransactionDrawer
      isOpen={isOpen}
      onClose={onClose}
      account={account}
      assetIn={assetIn}
      assetInIcon={undefined}
      assetInSymbol={`pt${baseAssetSymbol}`}
      walletConnectionActive={walletConnectionActive}
      amountIn={amountInAsBigNumber}
      chainId={chainId}
      connector={connector}
      library={library}
      onConfirmTransaction={onConfirmSellPrincipalTokens}
      transactionDetails={
        <TransactionDetailsForm
          amountIn={safeAmountIn}
          amountOut={amountOutFormatted}
          onAmountInChange={onAmountInChange}
          onAmountOutChange={onAmountOutChange}
          heading={t`Enter an amount to sell`}
          assetInIcon={null}
          assetInSymbol={`${baseAssetSymbol} Principal Token`}
          assetOutIcon={AssetIcon}
          assetOutSymbol={baseAssetSymbol}
        >
          <PrincipalTokenTransactionDetails
            spotPriceBaseAssetForOneToken={spotPriceBaseAssetForOneToken}
            baseAssetSymbol={baseAssetSymbol}
            unlockTimeStamp={unlockTimeStampDate}
            priceSlippageAndTradingFee={priceSlippageAndTradingFee}
          />
        </TransactionDetailsForm>
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

function makeCryptoAsset(token: ERC20 | undefined) {
  if (!token) {
    return;
  }

  const assetIn: CryptoAsset = {
    id: token?.address,
    type: CryptoAssetType.ERC20,
    tokenContract: token,
  };

  return assetIn;
}
