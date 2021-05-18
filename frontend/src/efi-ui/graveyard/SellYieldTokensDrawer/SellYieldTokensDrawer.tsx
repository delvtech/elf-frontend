import React, { ReactElement } from "react";

import { Web3Provider } from "@ethersproject/providers";
import { AbstractConnector } from "@web3-react/abstract-connector";
import { ERC20 } from "elf-contracts/types/ERC20";
import { InterestToken } from "elf-contracts/types/InterestToken";
import { Signer } from "ethers";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { t } from "ttag";

import { getBalancerApprovalMessage } from "efi-ui/balancer/balancerApprovalMessage";
import { useBalancerVault } from "efi-ui/balancer/useBalancerVault";
import { useBatchSwapGivenIn } from "efi-ui/balancer/useBatchSwapGivenIn/useBatchSwapGivenIn";
import { useQueryBatchSwapInputs } from "efi-ui/balancer/useQueryBatchSwapInputs";
import { ERC20Shim } from "efi-ui/contracts/ERC20Shim";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { getCryptoDecimals } from "efi/crypto/getCryptoDecimals";
import { getCryptoSymbol } from "efi/crypto/getCryptoSymbol";
import { SellYieldTokenDetails } from "efi-ui/graveyard/SellYieldTokensDrawer/SellYieldTokensDetails";
import { usePoolPairedToken } from "efi-ui/pools/usePoolPairedToken/usePoolPairedToken";
import { usePoolTokenPrices } from "efi-ui/pools/usePoolTokenPrices/usePoolTokenPrices";
import { getTokenAddressForBalancer } from "efi-ui/swaps/getTokenAddressForBalancer";
import { SwapDetailsForm } from "efi-ui/swaps/SwapDetailsPreview/SwapDetailsForm";
import { useTokenDecimals } from "efi-ui/token/hooks/useTokenDecimals";
import { TokenIcon } from "efi-ui/token/TokenIcon";
import { useTrancheForInterestToken } from "efi-ui/tranche/useTrancheForInterestToken";
import { TransactionDrawer } from "efi-ui/transactions/TransactionDrawer/TransactionDrawer";
import { convertEpochSecondsToDate } from "efi/base/convertEpochSecondsToDate";
import { CryptoAsset, CryptoAssetType } from "efi/crypto/CryptoAsset";
import { calculatePurchasePrice } from "efi/pools/calculatePurchasePrice";
import { calculateSlippage } from "efi/pools/calculateSlippage";
import { PoolContract } from "efi/pools/PoolContract";
import { getAmountOutWithTolerance } from "efi/trade/getAmountOutWithTolerance";

interface SellYieldTokensDrawerProps {
  chainId: number | undefined;
  account: string | null | undefined;
  walletConnectionActive: boolean;
  connector: AbstractConnector | undefined;
  library: Web3Provider | undefined;
  pool: PoolContract | undefined;
  baseAsset: CryptoAsset;
  baseAssetIcon: TokenIcon | undefined;
  yieldToken: InterestToken | undefined;
  isOpen: boolean;
  onClose: () => void;
}

export function SellYieldTokensDrawer(
  props: SellYieldTokensDrawerProps
): ReactElement {
  const {
    library,
    account,
    baseAsset,
    baseAssetIcon,
    yieldToken,
    isOpen,
    onClose,
    pool,
  } = props;
  const signer = account ? (library?.getSigner(account) as Signer) : undefined;
  const balancerVault = useBalancerVault();

  // base asset calls
  const tranche = useTrancheForInterestToken(yieldToken);
  const baseAssetSymbol = getCryptoSymbol(baseAsset);
  const baseAssetDecimals = getCryptoDecimals(baseAsset);

  // yield token calls
  const { data: yieldTokenDecimals } = useTokenDecimals(yieldToken);

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
  const baseAssetPoolToken = usePoolPairedToken(pool, yieldToken as ERC20Shim);
  const { spotPriceBaseAssetForOneToken, spotPriceTokenForOneBaseAsset } =
    usePoolTokenPrices(pool, baseAssetPoolToken);

  const yieldTokenAddress = yieldToken?.address;
  const baseAssetBalancerAddress = getTokenAddressForBalancer(baseAsset);
  const { amountIn, amountOut, onAmountInChange, onAmountOutChange } =
    useQueryBatchSwapInputs(
      pool,
      yieldTokenAddress,
      trancheDecimals,
      baseAssetBalancerAddress,
      baseAssetDecimals
    );

  // pool calls
  const amountInAsBigNumber = parseUnits(amountIn || "0", baseAssetDecimals);
  const amountOutAsBigNumber = parseUnits(amountOut || "0", yieldTokenDecimals);

  const minAmountOut = getAmountOutWithTolerance(
    amountOutAsBigNumber,
    baseAssetDecimals,
    0.01
  );

  const { batchSwapGivenIn: onConfirmSellPrincipalTokens } =
    useBatchSwapGivenIn(
      account,
      signer,
      pool,
      yieldToken?.address,
      baseAssetBalancerAddress,
      amountInAsBigNumber,
      minAmountOut
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

  const assetIn = makeCryptoAsset(yieldToken as ERC20Shim);

  // We want InputGroup to be a controlled component, but passing `undefined` is
  // how you express an uncontrolled component. Having this change between
  // uncontrolled and controlled causes bugginess and big warnings in the
  // console, so we use empty string here to keep everything controlled.
  const safeAmountIn = amountIn ?? "";

  const walletApprovalInfos = [
    {
      cryptoAsset: assetIn,
      ownerAddress: account,
      spenderAddress: balancerVault?.address,
      messageRenderer: getBalancerApprovalMessage,
    },
  ];

  return (
    <TransactionDrawer
      buttonLabel={t`Sell`}
      isOpen={isOpen}
      onClose={onClose}
      account={account}
      library={library}
      walletApprovalInfos={walletApprovalInfos}
      onConfirmTransaction={onConfirmSellPrincipalTokens}
      transactionDetails={
        <SwapDetailsForm
          amountIn={safeAmountIn}
          amountOut={amountOutFormatted}
          onAmountInChange={onAmountInChange}
          onAmountOutChange={onAmountOutChange}
          heading={t`Enter an amount to sell`}
          assetInIcon={null}
          assetInSymbol={`${baseAssetSymbol} Yield Token`}
          assetOutIcon={baseAssetIcon}
          assetOutSymbol={baseAssetSymbol}
        >
          <SellYieldTokenDetails
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
