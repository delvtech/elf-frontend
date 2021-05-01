import React, { ReactElement } from "react";

import { Classes } from "@blueprintjs/core";
import classNames from "classnames";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { usePendingTransaction } from "efi-ui/transactions/usePendingTransaction/usePendingTransaction";
import { WalletJazzicon } from "efi-ui/wallets/WalletJazzicon/WalletJazzicon";
import { formatWalletAddress } from "efi/wallets/formatWalletAddress";

interface TransactionPendingSummaryProps {
  account: string | null | undefined;
}

export function TransactionPendingSummary({
  account,
}: TransactionPendingSummaryProps): ReactElement | null {
  const { transactionHash } = usePendingTransaction();
  if (!transactionHash) {
    return null;
  }

  return (
    <div
      className={tw(
        "flex",
        "w-full",
        "items-center",
        "space-x-10",
        "justify-between"
      )}
    >
      <div className={classNames(tw("flex", "space-x-4", "items-center"))}>
        <WalletJazzicon account={account} />

        <div className={tw("flex", "flex-col")}>
          <div className={tw("flex", "items-center", "justify-between")}>
            <span className={classNames(Classes.TEXT_LARGE)}>
              <a
                title={t`View transaction on etherscan`}
                href={`https://etherscan.io/tx/${transactionHash}`}
                target="_blank"
                rel="noreferrer noopener"
              >
                {formatWalletAddress(transactionHash)}
              </a>
            </span>
          </div>
          <div className={tw("flex", "items-center", "justify-between")}>
            <span className={classNames(Classes.TEXT_MUTED)}>
              {t`Transaction pending...`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
