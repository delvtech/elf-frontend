import { FC, useCallback, useEffect, useState } from "react";

import { Button, Intent } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { ERC20 } from "elf-contracts/types/ERC20";
import { BigNumber, Signer } from "ethers";
import { formatEther, parseEther, parseUnits } from "ethers/lib/utils";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import {
  NumericInputOptions,
  useNumericInput,
} from "efi-ui/base/hooks/useNumericInput/useNumericInput";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { useOnSwapGivenIn } from "efi-ui/pools/useOnSwapGivenIn/useOnSwapGivenIn";
import { useTokenBalance } from "efi-ui/token/hooks/useTokenBalance";
import { TradeInput } from "efi-ui/trade/TradeInput/TradeInput";
import { ContractMethodArgs } from "efi/contracts/types";
import { CryptoSymbol } from "efi/crypto/CryptoSymbol";
import { PoolContract } from "efi/pools/PoolContract";
import { Web3Provider } from "@ethersproject/providers";

interface TradePanelProps {
  library: Web3Provider | undefined;
  signer: Signer | undefined;
  pool: PoolContract | undefined;
  account: string | null | undefined;
  formDisabled?: boolean;
  submitDisabled?: boolean;
  inputLabel: string;
  buttonLabel: string;
  buttonIntent?: Intent;
  tokenIn: ERC20 | undefined;
  tokenOut: ERC20 | undefined;
  onTransaction: (amount: BigNumber) => void;
}

const numericInputOptions: NumericInputOptions = {
  min: 0,
  /**
   * limit precision to prevent BigNumber overflows
   */
  maxPrecision: 18,
};

export const TradePanel: FC<TradePanelProps> = ({
  library,
  signer,
  formDisabled = false,
  submitDisabled = false,
  inputLabel,
  buttonLabel,
  buttonIntent = Intent.PRIMARY,
  onTransaction,
  pool,
  account,
  tokenIn: tokenInFromProps,
  tokenOut: tokenOutFromProps,
}) => {
  const [isReversed, setReversed] = useState(false);

  let tokenIn = tokenInFromProps;
  let tokenOut = tokenOutFromProps;
  if (isReversed) {
    tokenIn = tokenOutFromProps;
    tokenOut = tokenInFromProps;
  }

  const { data: tokenInSymbol } = useSmartContractReadCall(tokenIn, "symbol");
  const { data: tokenInDecimals } = useSmartContractReadCall(
    tokenIn,
    "decimals"
  );
  const { data: tokenInBalanceOf } = useSmartContractReadCall(
    tokenIn,
    "balanceOf",
    { enabled: !!account, callArgs: [account as string] }
  );
  const tokenInDisplayBalance = useTokenBalance(tokenIn, account);

  const { data: tokenOutSymbol } = useSmartContractReadCall(tokenOut, "symbol");
  const tokenOutDisplayBalance = useTokenBalance(tokenOut, account);

  const [stringValueIn, onChangeIn, setValueIn] = useNumericInput(
    numericInputOptions
  );
  const [stringValueOut, onChangeOut, setValueOut] = useNumericInput(
    numericInputOptions
  );

  const amountIn = stringValueIn ? parseEther(stringValueIn) : undefined;
  const { data: calcValueOut } = useOnSwapGivenIn(
    library,
    pool,
    account,
    tokenIn,
    amountIn
  );

  useUpdateOutWhenInChanges(calcValueOut, setValueOut, stringValueIn);

  const valueIn = stringValueIn
    ? parseUnits(stringValueIn, tokenInDecimals)
    : undefined;
  const validValue =
    valueIn && tokenInBalanceOf ? valueIn.lte(tokenInBalanceOf) : true;

  const swapAssets = useCallback(() => {
    setValueIn("");
    setReversed(!isReversed);
  }, [isReversed, setValueIn]);

  // TODO: make a useTokenApproval or useTokenApproved hook
  const callArgs: ContractMethodArgs<ERC20, "allowance"> = [
    account ?? "",
    pool?.address ?? "",
  ];
  const { data: approval } = useSmartContractReadCall(tokenIn, "allowance", {
    callArgs,
  });
  const approved =
    stringValueIn && approval
      ? approval.gte(parseUnits(stringValueIn, tokenInDecimals))
      : false;

  const submitTransaction = useCallback(() => {}, []);

  const setMaxValue = useCallback(() => {
    if (tokenInBalanceOf) {
      setValueIn(formatEther(tokenInBalanceOf));
    }
  }, [tokenInBalanceOf, setValueIn]);

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
        cryptoDisplayBalance={tokenInDisplayBalance}
        cryptoSymbol={tokenInSymbol as CryptoSymbol}
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
        cryptoDisplayBalance={tokenOutDisplayBalance}
        cryptoSymbol={tokenOutSymbol as CryptoSymbol}
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

function getButtonText(
  buttonLabel: string,
  approved: boolean,
  signer: Signer | undefined
) {
  if (!signer) {
    return t`Connect Wallet`;
  }

  if (!approved) {
    return `Approve Market`;
  }

  return buttonLabel;
}
