import { Card, Classes, H4, HTMLTable } from "@blueprintjs/core";
import React, { FunctionComponent } from "react";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { formatEthBalance } from "efi/ui/crypto/formatEthBalance";
import { useWallet } from "efi/ui/wallets/hooks/useWallet";
import styles from "efi/ui/wallets/WalletSummaryPane/WalletSummaryPane.module.css";

interface WalletBalancesCardProps {}

export const WalletBalancesCard: FunctionComponent<WalletBalancesCardProps> = () => {
  const { ethBalance, fiatBalance, wethBalance } = useWallet();
  const formattedEthBalance = ethBalance ? formatEthBalance(ethBalance) : "0";
  const formattedWethBalance = wethBalance
    ? formatEthBalance(wethBalance?.balance)
    : "0";

  return (
    <Card className={tw("flex", "flex-col", "space-y-4")}>
      <div className={tw("flex", "justify-between")}>
        <H4>{t`Wallet balance:`}</H4>
        <H4>$52,323.23</H4>
      </div>

      <HTMLTable striped className={tw("w-full")}>
        <thead>
          <tr className={Classes.TEXT_SMALL}>
            {[t`Asset`, t`Balance`, t`USD`].map((label) => (
              <th key={label} className={styles.tableHeader}>
                <span className={tw("text-xs")}>{label}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <div className={tw("flex", "space-x-2")}>
                <strong>ETH</strong>
              </div>
            </td>
            <td>{formattedEthBalance}</td>
            {fiatBalance && (
              <td>{`${fiatBalance.toDecimal().toLocaleString()}`}</td>
            )}
          </tr>

          <tr>
            <td>
              <div className={tw("flex", "space-x-2")}>
                <strong>wETH</strong>
              </div>
            </td>
            <td>{formattedWethBalance}</td>
            <td>$1,210.23</td>
          </tr>
        </tbody>
      </HTMLTable>
    </Card>
  );
};

export default WalletBalancesCard;
