import React, { ReactElement, useCallback, useState } from "react";

import { Callout, Colors } from "@blueprintjs/core";
import { Popover2 } from "@blueprintjs/popover2";
import classNames from "classnames";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { usePendingTransaction } from "efi-ui/prefs/usePendingTransaction/usePendingTransaction";
import { TransactionPendingSummary } from "efi-ui/transactions/TransactionPendingCard/TransactionPendingSummary";
import { ConnectWalletButtons } from "efi-ui/wallets/ConnectWalletButtons/ConnectWalletButtons";

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
}: TransactionPendingCardProps): ReactElement {
  const [isWalletDialogOpen, setWalletDialogOpen] = useState(false);
  const openWalletDialog = useCallback(() => setWalletDialogOpen(true), []);
  const closeWalletDialog = useCallback(() => setWalletDialogOpen(false), []);

  const connectionStatusColor = active ? Colors.GREEN4 : Colors.RED4;

  const { transactionHash } = usePendingTransaction();
  const connectorMessage = t`pending`;

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
        {!active || !transactionHash ? null : (
          <TransactionPendingSummary
            account={transactionHash}
            active={active}
            chainId={chainId}
            connectionStatusColor={connectionStatusColor}
            connectorMessage={connectorMessage}
          />
        )}
      </Callout>
    </Popover2>
  );
}
