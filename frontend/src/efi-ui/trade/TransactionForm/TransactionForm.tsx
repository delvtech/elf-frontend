import React, { ChangeEvent, ReactElement, useCallback } from "react";

import { Button, InputGroup, Intent, Tag } from "@blueprintjs/core";
import { BigNumber } from "ethers";
import { formatEther, parseUnits } from "ethers/lib/utils";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import {
  NumericInputOptions,
  useNumericInput,
} from "efi-ui/base/hooks/useNumericInput/useNumericInput";
import styles from "efi-ui/trade/TransactionForm/TransactionForm.module.css";
import { formatCurrency } from "efi/base/formatCurrency/formatCurrency";
import { TokenBalance } from "efi/crypto/TokenBalance";
import { findAssetIcon } from "efi-ui/crypto/CryptoIcon";

interface TransactionFormProps {
  formDisabled?: boolean;
  submitDisabled?: boolean;
  inputLabel: string;
  buttonLabel: string;
  buttonIntent?: Intent;
  cryptoSymbol: string | undefined;
  cryptoBalance: TokenBalance | undefined;
  onTransaction: (amount: BigNumber) => void;
}

const numericInputOptions: NumericInputOptions = {
  min: 0,
  /**
   * limit precision to prevent BigNumber overflows
   */
  maxPrecision: 18,
};

export function TransactionForm({
  formDisabled = false,
  submitDisabled = false,
  inputLabel,
  cryptoSymbol,
  cryptoBalance,
  buttonLabel,
  buttonIntent = Intent.PRIMARY,
  onTransaction,
}: TransactionFormProps): ReactElement {
  const CryptoIcon = findAssetIcon(cryptoSymbol);

  const { stringValue, onChange, setValue } =
    useNumericInput(numericInputOptions);
  const value = stringValue
    ? parseUnits(stringValue, cryptoBalance?.decimals)
    : undefined;
  const validValue =
    value && cryptoBalance ? value.lte(cryptoBalance.value) : true;

  const balance = formatCurrency(
    cryptoBalance?.value,
    cryptoBalance?.decimals.toNumber()
  );

  const onClick = useCallback(async () => {
    if (validValue && onTransaction) {
      if (!value) {
        return;
      }
      await onTransaction(value);
      // TODO: Hack to reset the value of the Numeric Input. This should instead
      // call onResetValue or something from userNumericInput instead.
      onChange({ target: { value: "" } } as ChangeEvent<HTMLInputElement>);
    }
  }, [onChange, onTransaction, validValue, value]);

  const setMaxValue = useCallback(() => {
    setValue(formatEther(cryptoBalance?.value as BigNumber));
  }, [cryptoBalance, setValue]);

  return (
    <div className={tw("flex", "flex-col", "space-y-5")}>
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
      <div className={tw("flex", "flex-col", "space-y-2")}>
        <InputGroup
          disabled={formDisabled}
          onChange={onChange}
          value={stringValue}
          className={styles.depositInput}
          large
          intent={validValue ? undefined : Intent.DANGER}
          rightElement={
            <Tag large minimal>
              <span>{cryptoSymbol}</span>
            </Tag>
          }
          leftElement={
            <div>
              {CryptoIcon ? <CryptoIcon height={18} width={18} /> : null}
            </div>
          }
        />
        <div className={tw("flex", "justify-between")}>
          <span
            className={tw("text-xs", "text-right", {
              "text-danger": !validValue,
            })}
          >{t`Balance:`}</span>
          <span
            className={tw("text-xs", "text-right", {
              "text-danger": !validValue,
            })}
          >{`${balance} ${cryptoSymbol}`}</span>
        </div>
      </div>
      <Button
        disabled={!value || !validValue || submitDisabled || formDisabled}
        onClick={onClick}
        minimal
        outlined
        large
        intent={buttonIntent}
      >
        {buttonLabel}
      </Button>
    </div>
  );
}
