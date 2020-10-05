import React, { FunctionComponent } from "react";
import { Card } from "@blueprintjs/core";
import { jt } from "ttag";
import { useAccountInfo } from "efi/ui/wallets/hooks";


interface WalletSummaryProps {}
export const WalletSummary: FunctionComponent<WalletSummaryProps> = props => {
  const { address, balance, ethBalance, providerName, isConnected }= useAccountInfo();

  if (!isConnected) {
    return null;
  }

  return (
    <Card>
      <div>{jt`Provider: ${providerName}`}</div>
      <div>{jt`Address: ${address}`}</div>
      <div>{jt`Balance: ${balance}`}</div>
      <div>{jt`Eth Balance: ${ethBalance}`}</div>
    </Card>
  );
}

export default WalletSummary;