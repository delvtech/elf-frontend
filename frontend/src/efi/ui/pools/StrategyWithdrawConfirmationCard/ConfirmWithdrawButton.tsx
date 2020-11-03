import React, { FC, useCallback } from "react";

import { Button, Intent } from "@blueprintjs/core";
import { BigNumber } from "ethers";
import { formatEther } from "ethers/lib/utils";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { CryptoSymbol } from "efi/crypto/CryptoSymbol";

interface ConfirmWithdrawButtonProps {
  buttonLabel: string;
  amountToWithdraw: BigNumber;
  cryptoSymbol: CryptoSymbol;
  cryptoBalance: BigNumber | undefined;
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
    ? amountToWithdraw.lte(cryptoBalance)
    : false;

  // TODO: make this component handle any type of crypto.  We'll formalize this into a function that
  // does the proper operations depending on the asset.  This is fine for V0.
  const ethBalance = cryptoBalance && formatEther(cryptoBalance);

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
        >{t`Available: ${ethBalance} ${cryptoSymbol}`}</span>
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
