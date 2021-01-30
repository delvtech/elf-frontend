import { Button, Intent } from "@blueprintjs/core";
import { BigNumber } from "ethers";
import { commify, formatEther } from "ethers/lib/utils";
import React, { FC, useCallback } from "react";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { CryptoSymbol } from "efi/crypto/CryptoSymbol";

interface ConfirmDepositButtonProps {
  buttonLabel: string;
  amountToDeposit: BigNumber;
  cryptoSymbol: CryptoSymbol;
  cryptoBalance: BigNumber | undefined;
  depositPending: boolean;
  onConfirmDeposit: (amount: BigNumber) => void;
}

export const ConfirmDepositButton: FC<ConfirmDepositButtonProps> = ({
  cryptoSymbol,
  cryptoBalance,
  amountToDeposit,
  buttonLabel,
  depositPending,
  onConfirmDeposit,
}) => {
  const validValue = cryptoBalance ? amountToDeposit.lte(cryptoBalance) : false;

  // TODO: make this component handle any type of crypto.  We'll formalize this into a function that
  // does the proper operations depending on the asset.  This is fine for V0.
  const ethBalance = cryptoBalance && commify(formatEther(cryptoBalance));

  const onClick = useCallback(() => {
    if (validValue && onConfirmDeposit) {
      onConfirmDeposit(amountToDeposit);
    }
  }, [amountToDeposit, onConfirmDeposit, validValue]);

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
        loading={depositPending}
        disabled={!validValue || depositPending}
        onClick={onClick}
        minimal
        outlined
        large
        intent={Intent.WARNING}
      >
        {buttonLabel}
      </Button>
    </div>
  );
};
