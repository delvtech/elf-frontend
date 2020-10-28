import React, { FunctionComponent } from "react";
import { Callout } from "@blueprintjs/core";
import { t } from "ttag";
import { useWallet } from "efi/ui/wallets/hooks/useWallet";
import { formatEther } from "@ethersproject/units";

interface WalletSummaryProps {
  className?: string;
}

export const WalletSummary: FunctionComponent<WalletSummaryProps> = ({
  className,
}) => {
  const { account, ethBalance = 0, library } = useWallet();

  if (!account || !library) {
    return null;
  }

  return (
    <Callout className={className}>
      <div>{t`Wallet connector: Metamask`}</div>
      <div>{t`Address: ${account}`}</div>
      <div>{t`Balance (gwei): ${ethBalance?.toString()}`}</div>
      <div>{t`Eth balance: ${formatEther(ethBalance)}`}</div>
    </Callout>
  );
};

export default WalletSummary;
