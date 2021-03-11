import React, {
  ChangeEvent,
  FC,
  useCallback,
  useEffect,
  useState,
} from "react";

import { Button, Intent } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { BPool } from "elf-contracts/types/BPool";
import { ERC20 } from "elf-contracts/types/ERC20";
import { BigNumber, Contract, Signer } from "ethers";
import { formatEther, parseEther, parseUnits } from "ethers/lib/utils";
import { t } from "ttag";

import { swapExactAmountIn } from "efi-balancer/swapExactAmountIn";
import tw from "efi-tailwindcss-classnames";
import { useCalcOutGivenIn } from "efi-ui/balancer/useCalcOutGivenIn";
import {
  NumericInputOptions,
  useNumericInput,
} from "efi-ui/base/hooks/useNumericInput/useNumericInput";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { usePairedAssetPrice } from "efi-ui/markets/usePairedAssetPrice";
import { useTokenBalance } from "efi-ui/token/hooks/useTokenBalance";
import { useTokenBalanceOf } from "efi-ui/token/hooks/useTokenBalanceOf";
import { useTokenDecimals } from "efi-ui/token/hooks/useTokenDecimals";
import { useTokenSymbol } from "efi-ui/token/hooks/useTokenSymbol";
import { TradeInput } from "efi-ui/trade/TradeInput/TradeInput";
import { MAX_ALLOWANCE } from "efi/contracts/token";
import { ContractMethodArgs } from "efi/contracts/types";
import { CryptoSymbol } from "efi/crypto/CryptoSymbol";
import { DEFAULT_SLIPPAGE } from "efi/markets/slippage";

interface TradePanelOldProps {
  signer: Signer | undefined;
  marketContract: BPool | undefined;
  accountAddress: string | null | undefined;
  formDisabled?: boolean;
  submitDisabled?: boolean;
  inputLabel: string;
  buttonLabel: string;
  buttonIntent?: Intent;
  /**
   * [baseAsset, yieldAsset]
   */
  assetContracts: [ERC20, ERC20] | undefined;
  onTransaction: (amount: BigNumber) => void;
}

const numericInputOptions: NumericInputOptions = {
  min: 0,
  /**
   * limit precision to prevent BigNumber overflows
   */
  maxPrecision: 18,
};

/**
 * @deprecated BPool is deprecated. use TradePanel instead
 */
export const TradePanelOld: FC<TradePanelOldProps> = ({
  signer,
  formDisabled = false,
  submitDisabled = false,
  inputLabel,
  buttonLabel,
  buttonIntent = Intent.PRIMARY,
  onTransaction,
  marketContract,
  accountAddress,
  assetContracts,
}) => {
  const [assetsSwapped, setAssetsSwapped] = useState(false);

  let tradeContract = assetContracts?.[0];
  let receiveContract = assetContracts?.[1];

  if (assetsSwapped) {
    tradeContract = assetContracts?.[1];
    receiveContract = assetContracts?.[0];
  }

  const { data: spotPrice } = usePairedAssetPrice(
    marketContract?.address,
    receiveContract?.address
  );

  const { data: swapFee } = useSmartContractReadCall(
    marketContract,
    "getSwapFee"
  );

  const [tradeCryptoSymbol] = useTokenSymbol(tradeContract);
  const [tradeCryptoDecimals] = useTokenDecimals(tradeContract);
  const [tradeCryptoBalance] = useTokenBalanceOf(tradeContract, accountAddress);
  const tradeCryptoDisplayBalance = useTokenBalance(
    tradeContract,
    accountAddress
  );

  const [receiveCryptoSymbol] = useTokenSymbol(receiveContract);
  const [receiveCryptoBalance] = useTokenBalanceOf(
    receiveContract,
    accountAddress
  );
  const receiveCryptoDisplayBalance = useTokenBalance(
    receiveContract,
    accountAddress
  );

  const [stringValueIn, onChangeIn, setValueIn] = useNumericInput({
    ...numericInputOptions,
  });
  const [stringValueOut, onChangeOut, setValueOut] = useNumericInput(
    numericInputOptions
  );

  const amountIn = stringValueIn ? parseEther(stringValueIn) : undefined;
  const { data: calcValueOut } = useCalcOutGivenIn(
    amountIn,
    tradeContract,
    receiveContract,
    marketContract
  );

  useUpdateOutWhenInChanges(calcValueOut, setValueOut, stringValueIn);

  const valueIn = stringValueIn
    ? parseUnits(stringValueIn, tradeCryptoDecimals)
    : undefined;
  const validValue =
    valueIn && tradeCryptoBalance ? valueIn.lte(tradeCryptoBalance) : true;

  const swapAssets = useCallback(() => {
    setValueIn("");
    setAssetsSwapped(!assetsSwapped);
  }, [assetsSwapped, setValueIn]);

  // TODO: make a useTokenApproval or useTokenApproved hook
  const callArgs: ContractMethodArgs<ERC20, "allowance"> = [
    accountAddress ?? "",
    marketContract?.address ?? "",
  ];
  const { data: approval } = useSmartContractReadCall(
    tradeContract,
    "allowance",
    {
      callArgs,
    }
  );
  const approved =
    stringValueIn && approval
      ? approval.gte(parseUnits(stringValueIn, tradeCryptoDecimals))
      : false;

  // TODO: clean this up!  undefineds are ridiculous here, I"m thinking I'll make a skeleton
  // component until things are loaded which most times they will be already.
  const submitTransaction = useSubmitTransaction(
    validValue,
    onTransaction,
    accountAddress,
    signer,
    valueIn,
    stringValueIn,
    tradeContract,
    receiveContract,
    marketContract,
    tradeCryptoBalance,
    receiveCryptoBalance,
    amountIn,
    swapFee,
    stringValueOut,
    approved,
    spotPrice,
    onChangeIn
  );

  const setMaxValue = useCallback(() => {
    if (tradeCryptoBalance) {
      setValueIn(formatEther(tradeCryptoBalance));
    }
  }, [tradeCryptoBalance, setValueIn]);

  const submitButtonText = getButtonText(buttonLabel, approved, signer);
  const submitButtonDisabled =
    formDisabled ||
    submitDisabled ||
    !validValue ||
    !stringValueIn ||
    !stringValueOut ||
    !signer;
  return (
    <div className={tw("flex", "flex-col", "space-y-5")}>
      {/* Trade Asset */}
      <div className={tw("flex", "justify-between", "items-center")}>
        <span>{inputLabel}</span>
        <Button
          disabled={formDisabled}
          onClick={setMaxValue}
          minimal
          outlined
          small
          intent={Intent.SUCCESS}
        >{t`MAX`}</Button>
      </div>
      <TradeInput
        cryptoDisplayBalance={tradeCryptoDisplayBalance}
        cryptoSymbol={tradeCryptoSymbol as CryptoSymbol}
        disabled={formDisabled}
        onChange={onChangeIn}
        value={stringValueIn}
        validValue={validValue}
      />

      <Button
        icon={IconNames.ARROWS_VERTICAL}
        onClick={swapAssets}
        minimal
        large
        intent={buttonIntent}
      ></Button>

      {/* Receive Asset */}
      <div className={tw("flex", "justify-between", "items-center")}>
        <span>{t`For`}</span>
      </div>
      <TradeInput
        cryptoDisplayBalance={receiveCryptoDisplayBalance}
        cryptoSymbol={receiveCryptoSymbol as CryptoSymbol}
        disabled={formDisabled}
        onChange={onChangeOut}
        value={stringValueOut}
        validValue={validValue}
      />
      <Button
        disabled={submitButtonDisabled}
        onClick={submitTransaction}
        minimal
        outlined
        large
        intent={buttonIntent}
      >
        {submitButtonText}
      </Button>
    </div>
  );
};
function useSubmitTransaction(
  validValue: boolean,
  onTransaction: (amount: BigNumber) => void,
  accountAddress: string | null | undefined,
  signer: Signer | undefined,
  valueIn: BigNumber | undefined,
  stringValueIn: string | undefined,
  tradeContract: ERC20 | undefined,
  receiveContract: ERC20 | undefined,
  marketContractWithSigner: BPool | undefined,
  tradeCryptoBalance: BigNumber | undefined,
  receiveCryptoBalance: BigNumber | undefined,
  amountIn: BigNumber | undefined,
  swapFee: BigNumber | undefined,
  stringValueOut: string | undefined,
  approved: boolean,
  spotPrice: BigNumber | undefined,
  onChangeIn: (event: React.ChangeEvent<HTMLInputElement>) => void
) {
  const {
    weightOfTokenIn,
    weightOfTokenOut,
    tokenOutMarketBalance,
    tokenInMarketBalance,
  } = useMarketTokenInfo(
    marketContractWithSigner,
    tradeContract?.address,
    receiveContract?.address
  );

  return useCallback(async () => {
    if (validValue && onTransaction) {
      if (
        !accountAddress ||
        !signer ||
        !valueIn ||
        !stringValueIn ||
        !tradeContract ||
        !receiveContract ||
        !marketContractWithSigner ||
        !tradeContract ||
        !tradeCryptoBalance ||
        !receiveCryptoBalance ||
        !amountIn ||
        !weightOfTokenIn ||
        !weightOfTokenOut ||
        !swapFee ||
        !tokenInMarketBalance ||
        !tokenOutMarketBalance ||
        !stringValueOut
      ) {
        return;
      }
      if (!Number.isFinite(Number(stringValueOut))) {
        return;
      }
      // TODO: hook this up to its own button
      if (!approved) {
        await getApproval(tradeContract, marketContractWithSigner, signer);
        return;
      }

      const tokenBalanceInAfterSwap = tokenInMarketBalance.add(amountIn);

      const valueOut = parseEther(stringValueOut);
      const tokenBalanceOutAfterSwap = tokenOutMarketBalance.sub(valueOut);

      const spotPriceAfter = await marketContractWithSigner.calcSpotPrice(
        tokenBalanceInAfterSwap,
        weightOfTokenIn,
        tokenBalanceOutAfterSwap,
        weightOfTokenOut,
        swapFee
      );

      await swapExactAmountIn(
        parseEther(stringValueIn),
        spotPrice,
        spotPriceAfter,
        DEFAULT_SLIPPAGE,
        tradeContract.connect(signer),
        receiveContract,
        marketContractWithSigner
      );
      await onTransaction(valueIn);
      // TODO: Hack to reset the value of the Numeric Input. This should instead
      // call onResetValue or something from userNumericInput instead.
      onChangeIn({ target: { value: "" } } as ChangeEvent<HTMLInputElement>);
    }
  }, [
    accountAddress,
    amountIn,
    approved,
    marketContractWithSigner,
    onChangeIn,
    onTransaction,
    receiveContract,
    receiveCryptoBalance,
    signer,
    spotPrice,
    stringValueIn,
    stringValueOut,
    swapFee,
    tokenInMarketBalance,
    tokenOutMarketBalance,
    tradeContract,
    tradeCryptoBalance,
    validValue,
    valueIn,
    weightOfTokenIn,
    weightOfTokenOut,
  ]);
}

function useUpdateOutWhenInChanges(
  calcValueOut: BigNumber | undefined,
  setValueOut: (value: string) => void,
  stringValueIn: string | undefined
) {
  useEffect(() => {
    if (calcValueOut) {
      setValueOut(formatEther(calcValueOut));
    } else {
      setValueOut("");
    }
  }, [calcValueOut, setValueOut, stringValueIn]);
}

// TODO:  use useMutation for this and share it.  will do this in a follow-up PR
async function getApproval<F extends ERC20, T extends Contract>(
  tokensFromContract: F,
  tokensToContract: T,
  signer: Signer
) {
  const txReceipt = await tokensFromContract
    .connect(signer)
    .approve(tokensToContract.address, MAX_ALLOWANCE);
  await txReceipt.wait(1);
  return txReceipt;
}

const useMarketTokenInfo = (
  marketContract: BPool | undefined,
  tokenInAddress: string | undefined,
  tokenOutAddress: string | undefined
) => {
  const { data: weightOfTokenIn } = useSmartContractReadCall(
    marketContract,
    "getDenormalizedWeight",
    {
      callArgs: [tokenInAddress as string],
      enabled: !!tokenInAddress,
    }
  );
  const { data: weightOfTokenOut } = useSmartContractReadCall(
    marketContract,
    "getDenormalizedWeight",
    {
      callArgs: [tokenOutAddress as string],
      enabled: !!tokenOutAddress,
    }
  );
  const { data: tokenOutMarketBalance } = useSmartContractReadCall(
    marketContract,
    "getBalance",
    {
      callArgs: [tokenOutAddress as string],
      enabled: !!tokenOutAddress,
    }
  );
  const { data: tokenInMarketBalance } = useSmartContractReadCall(
    marketContract,
    "getBalance",
    {
      callArgs: [tokenInAddress as string],
      enabled: !!tokenInAddress,
    }
  );

  return {
    weightOfTokenIn,
    weightOfTokenOut,
    tokenOutMarketBalance,
    tokenInMarketBalance,
  };
};

const getButtonText = (
  buttonLabel: string,
  approved: boolean,
  signer: Signer | undefined
) => {
  if (!signer) {
    return t`Connect Wallet`;
  }

  if (!approved) {
    return `Approve Market`;
  }

  return buttonLabel;
};
