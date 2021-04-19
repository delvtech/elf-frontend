import React, { ReactElement, useCallback, useState } from "react";

import { Callout } from "@blueprintjs/core";
import { Popover2 } from "@blueprintjs/popover2";
import classNames from "classnames";

import tw from "efi-tailwindcss-classnames";
import { usePendingTransactionPref } from "efi-ui/prefs/usePendingTransactionPref/usePendingTransactionPref";
import { TransactionPendingSummary } from "efi-ui/transactions/TransactionPendingCard/TransactionPendingSummary";
import { ConnectWalletButtons } from "efi-ui/wallets/ConnectWalletButtons/ConnectWalletButtons";
import { usePendingTransaction } from "efi-ui/transactions/usePendingTransaction/usePendingTransaction";

interface TransactionPendingCardProps {
  chainId: number | undefined;
  account: string | null | undefined;
  active: boolean;
  connectorName: string | undefined;

  className?: string;
}

export function TransactionPendingCard({
  chainId,
  account,
  active,
  connectorName,
  className,
}: TransactionPendingCardProps): ReactElement | null {
  const [isWalletDialogOpen, setWalletDialogOpen] = useState(false);
  const openWalletDialog = useCallback(() => setWalletDialogOpen(true), []);
  const closeWalletDialog = useCallback(() => setWalletDialogOpen(false), []);

  const transactionHash = usePendingTransaction();

  if (!transactionHash || !active) {
    return null;
  }

  return (
    <Popover2
      minimal
      isOpen={isWalletDialogOpen}
      onClose={closeWalletDialog}
      content={
        <div className={tw("w-400")}>
          <ConnectWalletButtons vertical onClick={closeWalletDialog} />
        </div>
      }
    >
      <Callout
        className={classNames(tw("flex", "items-center"), className)}
        onClick={openWalletDialog}
      >
        <TransactionPendingSummary
          account={account}
          transactionHash={transactionHash}
          active={active}
          chainId={chainId}
        />
      </Callout>
    </Popover2>
  );
}
