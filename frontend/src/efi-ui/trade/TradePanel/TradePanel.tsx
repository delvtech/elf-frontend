import React, { FC, useCallback, useEffect, useState } from "react";

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
import { usePairedAssetPrice } from "efi-ui/markets/usePairedAssetPrice";
import { useTokenBalance } from "efi-ui/token/hooks/useTokenBalance";
import { useTokenBalanceOf } from "efi-ui/token/hooks/useTokenBalanceOf";
import { useTokenDecimals } from "efi-ui/token/hooks/useTokenDecimals";
import { useTokenSymbol } from "efi-ui/token/hooks/useTokenSymbol";
import { TradeInput } from "efi-ui/trade/TradeInput/TradeInput";
import { MAX_ALLOWANCE } from "efi/contracts/token";
import { CryptoSymbol } from "efi/crypto/CryptoSymbol";
import { TokenBalance } from "efi/crypto/TokenBalance";
import { Market } from "efi/markets/Market";
import { DEFAULT_SLIPPAGE } from "efi/markets/slippage";

interface TradePanelProps {
  signer: Signer | undefined;
  marketContractWithSigner: BPool | undefined;
  accountAddress: string | null | undefined;
  market: Market | undefined;
  formDisabled?: boolean;
  submitDisabled?: boolean;
  inputLabel: string;
  buttonLabel: string;
  buttonIntent?: Intent;
  tradeCryptoSymbol: CryptoSymbol;
  tradeCryptoBalance: TokenBalance | undefined;
  receiveCryptoSymbol: CryptoSymbol;
  receiveCryptoBalance: TokenBalance | undefined;
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

export const TradePanel: FC<TradePanelProps> = ({
  signer,
  formDisabled = false,
  submitDisabled = false,
  inputLabel,
  buttonLabel,
  buttonIntent = Intent.PRIMARY,
  onTransaction,
  market,
  marketContractWithSigner,
  accountAddress,
  assetContracts,
}) => {
  const [assetsSwapped, setAssetsSwapped] = useState(false);
  const swapAssets = useCallback(() => {
    setAssetsSwapped(!assetsSwapped);
  }, [assetsSwapped]);

  let tradeContract = assetContracts?.[0];
  let receiveContract = assetContracts?.[1];

  if (assetsSwapped) {
    tradeContract = assetContracts?.[1];
    receiveContract = assetContracts?.[0];
  }

  const { data: spotPrice } = usePairedAssetPrice(
    marketContractWithSigner?.address,
    tradeContract?.address
  );

  const [tradeCryptoSymbol] = useTokenSymbol(tradeContract);
  const [tradeCryptoDecimals] = useTokenDecimals(tradeContract);
  const [tradeCryptoBalance] = useTokenBalanceOf(tradeContract, accountAddress);
  const tradeCryptoDisplayBalance = useTokenBalance(
    tradeContract,
    accountAddress
  );

  const [receiveCryptoSymbol] = useTokenSymbol(receiveContract);
  const receiveCryptoDisplayBalance = useTokenBalance(
    receiveContract,
    accountAddress
  );

  const [stringValueIn, onChangeIn, setValueIn] = useNumericInput(
    numericInputOptions
  );
  const [stringValueOut, onChangeOut, setValueOut] = useNumericInput(
    numericInputOptions
  );

  const amountIn = stringValueIn ? parseEther(stringValueIn) : undefined;
  const { data: calcValueOut } = useCalcOutGivenIn(
    amountIn,
    tradeContract,
    receiveContract,
    marketContractWithSigner
  );
  useUpdateOutWhenInChanges(calcValueOut, setValueOut, stringValueIn);

  const valueIn = stringValueIn
    ? parseUnits(stringValueIn, tradeCryptoDecimals)
    : undefined;
  const validValue =
    valueIn && tradeCryptoBalance ? valueIn.lte(tradeCryptoBalance) : true;

  // TODO: clean this up!  undefineds are ridiculous here, I"m thinking I'll make a skeleton
  // component until things are loaded which most times they will be already.
  const submitTransaction = useCallback(async () => {
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
        !amountIn
      ) {
        return;
      }
      const approval = await tradeContract.allowance(
        accountAddress,
        marketContractWithSigner.address
      );

      // TODO: hook this up to its own button
      if (!approval.gte(tradeCryptoBalance)) {
        await getApproval(tradeContract, marketContractWithSigner, signer);
        return;
      }

      await swapExactAmountIn(
        parseEther(stringValueIn),
        spotPrice,
        DEFAULT_SLIPPAGE,
        tradeContract.connect(signer),
        receiveContract,
        marketContractWithSigner
      );
      await onTransaction(valueIn);
      // TODO: Hack to reset the value of the Numeric Input. This should instead
      // call onResetValue or something from userNumericInput instead.
      onChangeIn({ target: { value: "" } } as any);
    }
  }, [
    accountAddress,
    amountIn,
    marketContractWithSigner,
    onChangeIn,
    onTransaction,
    receiveContract,
    signer,
    spotPrice,
    stringValueIn,
    tradeContract,
    tradeCryptoBalance,
    validValue,
    valueIn,
  ]);

  const setMaxValue = useCallback(() => {
    if (tradeCryptoBalance) {
      setValueIn(formatEther(tradeCryptoBalance));
    }
  }, [tradeCryptoBalance, setValueIn]);

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
        disabled={!valueIn || !validValue || submitDisabled || formDisabled}
        onClick={submitTransaction}
        minimal
        outlined
        large
        intent={buttonIntent}
      >
        {buttonLabel}
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
