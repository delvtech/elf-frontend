import React, { FunctionComponent } from "react";
import { Card } from "@blueprintjs/core";
import { t } from "ttag";
import { useWallet } from "efi/ui/wallets/hooks/useWallet";
import { formatEther } from "@ethersproject/units";

interface WalletSummaryProps {
  className?: string;
}
export const WalletSummary: FunctionComponent<WalletSummaryProps> = ({
  className,
}) => {
  const { account, ethBalance, library, active, connectorName } = useWallet();

  if (!active || !library || !ethBalance) {
    return null;
  }

  return (
    <Card className={className}>
      <div>{t`Wallet connector: ${connectorName}`}</div>
      <div>{t`Address: ${account}`}</div>
      <div>{t`Balance (gwei): ${ethBalance?.toString()}`}</div>
      <div>{t`Eth balance: ${formatEther(ethBalance)}`}</div>
    </Card>
  );
};

export default WalletSummary;
