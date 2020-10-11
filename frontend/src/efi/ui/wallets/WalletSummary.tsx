import React, { FunctionComponent } from "react";
import { Card } from "@blueprintjs/core";
import { t } from "ttag";
import { useWallet } from "efi/ui/wallets/hooks/useWallet";
import { Web3Provider } from "@ethersproject/providers";
import { formatEther } from "@ethersproject/units";

interface WalletSummaryProps {
  className?: string;
}
export const WalletSummary: FunctionComponent<WalletSummaryProps> = ({
  className,
}) => {
  const { account, ethBalance, library, active } = useWallet();

  if (!active || !library || !ethBalance) {
    return null;
  }

  const providerName = getWalletProviderName(library);
  return (
    <Card className={className}>
      <div>{t`Provider: ${providerName}`}</div>
      <div>{t`Address: ${account}`}</div>
      <div>{t`Balance (Gwei): ${ethBalance?.toString()}`}</div>
      <div>{t`Eth Balance: ${formatEther(ethBalance)}`}</div>
    </Card>
  );
};

export default WalletSummary;

function getWalletProviderName(library: Web3Provider): string {
  return library?.connection.url || "";
}
