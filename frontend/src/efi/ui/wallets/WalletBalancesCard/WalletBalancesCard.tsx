import React, { FunctionComponent } from "react";

import { Card, Classes, H4, HTMLTable } from "@blueprintjs/core";
import { Money } from "ts-money";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { getFormattedBalance } from "efi/crypto/balance";
import { useCryptoPrice } from "efi/ui/crypto/hooks/useCryptoPrice/useCryptoPrice";
import { useWallet } from "efi/ui/wallets/hooks/useWallet";
import styles from "efi/ui/wallets/WalletSummaryPane/WalletSummaryPane.module.css";

interface WalletBalancesCardProps {}

export const WalletBalancesCard: FunctionComponent<WalletBalancesCardProps> = () => {
  const { balances, fiatBalance } = useWallet();
  const formattedEthBalance = getFormattedBalance(balances.ETH);
  const formattedWethBalance = getFormattedBalance(balances.WETH);
  const { data: ethPrice } = useCryptoPrice("ETH");
  const totalBalance =
    (Number(formattedEthBalance) + Number(formattedWethBalance)) *
    (ethPrice || 0);

  return (
    <Card className={tw("flex", "flex-col", "space-y-4")}>
      <div className={tw("flex", "justify-between")}>
        <H4>{t`Wallet balance:`}</H4>
        <H4>${totalBalance.toLocaleString()}</H4>
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
