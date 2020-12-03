import React, { FC, useCallback } from "react";

import { Button, Intent } from "@blueprintjs/core";
import { BigNumber } from "ethers";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { getFormattedBalance } from "efi/crypto/balance";
import { BalanceInfo } from "efi/crypto/BalanceInfo";
import { CryptoSymbol } from "efi/crypto/CryptoSymbol";

interface ConfirmWithdrawButtonProps {
  buttonLabel: string;
  amountToWithdraw: BigNumber;
  cryptoSymbol: CryptoSymbol;
  cryptoBalance: BalanceInfo | undefined;
  withdrawPending: boolean;
  onConfirmWithdraw: (amount: BigNumber) => void;
}

export const ConfirmWithdrawButton: FC<ConfirmWithdrawButtonProps> = ({
  cryptoSymbol,
  cryptoBalance,
  amountToWithdraw,
  buttonLabel,
  withdrawPending,
  onConfirmWithdraw,
}) => {
  const validValue = cryptoBalance
    ? amountToWithdraw.lte(cryptoBalance.value)
    : false;

  const balance = getFormattedBalance(cryptoBalance);

  const onClick = useCallback(() => {
    if (validValue && onConfirmWithdraw) {
      onConfirmWithdraw(amountToWithdraw);
    }
  }, [amountToWithdraw, onConfirmWithdraw, validValue]);

  return (
    <div className={tw("flex", "flex-col", "space-y-5")}>
      <div className={tw("flex", "flex-col", "space-y-2")}>
        <span
          className={tw("text-xs", "text-right", {
            "text-red-500": !validValue,
          })}
        >{t`Available: ${balance} ${cryptoSymbol}`}</span>
      </div>
      <Button
        loading={withdrawPending}
        disabled={!validValue || withdrawPending}
        onClick={onClick}
        minimal
        outlined
        large
        intent={Intent.PRIMARY}
      >
        {buttonLabel}
      </Button>
    </div>
  );
};
