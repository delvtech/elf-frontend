import { ReactElement, useCallback, useEffect, useState } from "react";

import { Button, Intent } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Web3Provider } from "@ethersproject/providers";
import { ERC20 } from "elf-contracts/types/ERC20";
import { BigNumber, Signer } from "ethers";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { useBalancerTransactionInputs } from "efi-ui/balancer/useBalancerTransactionInputs";
import {
  NumericInputOptions,
  useNumericInput,
} from "efi-ui/base/hooks/useNumericInput/useNumericInput";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { useCryptoAssetForToken } from "efi-ui/crypto/hooks/useCryptoAssetForToken";
import { useCryptoAssetMetadata } from "efi-ui/crypto/hooks/useCryptoAssetMetadata/useCryptAssetMetadata";
import { useCryptoBalance } from "efi-ui/crypto/hooks/useCryptoBalance/useCryptoBalance";
import { useTokenPoolBalance } from "efi-ui/pools/useTokenPoolBalance/useTokenPoolBalance";
import { TradeInput } from "efi-ui/trade/TradeInput/TradeInput";
import { formatBalance } from "efi/base/formatBalance";
import { ContractMethodArgs } from "efi/contracts/types";
import { CryptoSymbol } from "efi/crypto/CryptoSymbol";
import { PoolContract } from "efi/pools/PoolContract";
import { validateTradeValues } from "efi/trade/validateTradeValues";

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

export function TradePanel(props: TradePanelProps): ReactElement {
  const {
    signer,
    formDisabled = false,
    submitDisabled = false,
    inputLabel,
    buttonLabel,
    buttonIntent = Intent.PRIMARY,
    pool,
    account,
    library,
    tokenIn: tokenInFromProps,
    tokenOut: tokenOutFromProps,
  } = props;

  const { tokenIn, tokenOut, swapAssets } = useReversableTokens(
    tokenInFromProps,
    tokenOutFromProps
  );

  const {
    symbol: tokenInSymbol,
    decimals: tokenInDecimals,
    balanceOf: tokenInBalanceOf,
    displayBalance: tokenInDisplayBalance,
    poolBalance: tokenInPoolBalance,
  } = useTokenInfoForTradeInput(pool, tokenIn, account, library);

  const {
    symbol: tokenOutSymbol,
    decimals: tokenOutDisplayBalance,
    poolBalance: tokenOutPoolBalance,
  } = useTokenInfoForTradeInput(pool, tokenIn, account, library);

  const {
    amountIn,
    amountOut,
    onChangeIn,
    onChangeOut,
    setValueIn,
  } = useUpdateInputs(pool, tokenIn, tokenOut, tokenInDecimals);

  const { isValidTokenInValue, isValidTokenOutValue } = validateTradeValues(
    amountIn,
    tokenInBalanceOf,
    tokenInDecimals,
    tokenInPoolBalance,
    amountOut,
    tokenOutPoolBalance
  );

  const approved = useTokenApproval(
    account,
    pool,
    tokenIn,
    amountIn,
    amountOut,
    tokenInDecimals
  );

  const submitTransaction = useCallback(() => {}, []);

  const setMaxValue = useSetMaxValue(
    tokenInBalanceOf,
    setValueIn,
    tokenInDecimals
  );

  const submitButtonText = getSubmitButtonText(buttonLabel, approved, signer);

  const submitButtonDisabled =
    formDisabled ||
    submitDisabled ||
    !isValidTokenInValue ||
    !isValidTokenOutValue ||
    !amountIn ||
    !amountOut ||
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
        cryptoDisplayBalance={tokenInDisplayBalance || ""}
        cryptoSymbol={tokenInSymbol as CryptoSymbol}
        disabled={formDisabled}
        onChange={onChangeIn}
        value={amountIn}
        validValue={isValidTokenInValue}
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
        cryptoDisplayBalance={tokenOutDisplayBalance || ""}
        cryptoSymbol={tokenOutSymbol as CryptoSymbol}
        disabled={formDisabled}
        onChange={onChangeOut}
        value={amountOut}
        validValue={isValidTokenOutValue}
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
}

function useSetMaxValue(
  tokenInBalanceOf: BigNumber | undefined,
  setValueIn: (value: string) => void,
  tokenInDecimals: number | undefined
) {
  return useCallback(() => {
    if (tokenInBalanceOf) {
      setValueIn(formatUnits(tokenInBalanceOf, tokenInDecimals));
    }
  }, [tokenInBalanceOf, setValueIn, tokenInDecimals]);
}

function useReversableTokens(
  tokenInFromProps: ERC20 | undefined,
  tokenOutFromProps: ERC20 | undefined
) {
  const [isReversed, setReversed] = useState(false);
  const swapAssets = useCallback(() => {
    setReversed(!isReversed);
  }, [isReversed]);

  let tokenIn = tokenInFromProps;
  let tokenOut = tokenOutFromProps;
  if (isReversed) {
    tokenIn = tokenOutFromProps;
    tokenOut = tokenInFromProps;
  }
  return { tokenIn, tokenOut, swapAssets };
}

// TODO: clean this up, I don't know what we need amountOut in here
function useTokenApproval(
  account: string | null | undefined,
  pool: PoolContract | undefined,
  tokenIn: ERC20 | undefined,
  amountIn: string | undefined,
  amountOut: string | undefined,
  tokenInDecimals: number | undefined
) {
  // safe to cast callArgs since we don't enable the call unless they are defnied
  const callArgs: ContractMethodArgs<ERC20, "allowance"> = [
    account as string,
    pool?.address as string,
  ];
  const { data: allowance } = useSmartContractReadCall(tokenIn, "allowance", {
    callArgs,
    enabled: !!pool?.address && !!account,
  });
  const approved =
    amountIn && allowance
      ? allowance.gte(parseUnits(amountOut || "0", tokenInDecimals))
      : false;
  return approved;
}

function getSubmitButtonText(
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

function useTokenInfoForTradeInput(
  pool: PoolContract | undefined,
  tokenContract: ERC20 | undefined,
  account: string | null | undefined,
  library: Web3Provider | undefined
) {
  const asset = useCryptoAssetForToken(tokenContract?.address);
  const { decimals, symbol } = useCryptoAssetMetadata(asset);
  const balanceOf = useCryptoBalance(library, account, asset);
  const poolBalance = useTokenPoolBalance(pool, tokenContract);
  const displayBalance = formatBalance(balanceOf, decimals);

  return {
    asset,
    symbol,
    decimals,
    balanceOf,
    displayBalance,
    poolBalance,
  };
}

function useUpdateInputs(
  pool: PoolContract | undefined,
  tokenIn: ERC20 | undefined,
  tokenOut: ERC20 | undefined,
  tokenInDecimals: number | undefined
) {
  // Since updates to amountIn updates amountOut and vice versa, useBalancerTransactionInputs
  // ensures we don't get infinite updates.
  const {
    amountIn,
    amountOut,
    onAmountOutChange,
    onAmountInChange,
  } = useBalancerTransactionInputs(
    pool,
    tokenIn?.address,
    tokenInDecimals,
    tokenOut?.address,
    tokenInDecimals
  );

  // useNumericInput ensures valid numeric inputs from the user
  const {
    stringValue: stringValueIn,
    onChange: onChangeIn,
    setValue: setValueIn,
  } = useNumericInput(numericInputOptions);
  const {
    stringValue: stringValueOut,
    onChange: onChangeOut,
  } = useNumericInput(numericInputOptions);

  useEffect(() => {
    onAmountInChange(stringValueIn);
  }, [onAmountInChange, stringValueIn]);

  useEffect(() => {
    onAmountOutChange(stringValueOut);
  }, [onAmountOutChange, stringValueOut]);

  return { amountIn, amountOut, onChangeIn, onChangeOut, setValueIn };
}
