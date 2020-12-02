import {
  Card,
  Classes,
  H4,
  HTMLTable,
  Icon,
  NonIdealState,
} from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import classNames from "classnames";
import React, { FunctionComponent } from "react";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { formatChainName } from "efi/ui/crypto/formatChainName";
import { formatEthBalance } from "efi/ui/crypto/formatEthBalance";
import { useDarkMode } from "efi/ui/prefs/useDarkMode/useDarkMode";
import { formatWalletAddress } from "efi/ui/wallets/formatWalletAddress";
import { useWallet } from "efi/ui/wallets/hooks/useWallet";
import styles from "efi/ui/wallets/WalletSummaryPane/WalletSummaryPane.module.css";

interface WalletSummaryPaneProps {}

export const WalletSummaryPane: FunctionComponent<WalletSummaryPaneProps> = () => {
  const { chainId, account, active } = useWeb3React<Web3Provider>();
  const { isDarkMode } = useDarkMode();

  const { ethBalance, fiatBalance, wethBalance } = useWallet();
  const formattedEthBalance = ethBalance ? formatEthBalance(ethBalance) : "0";
  const formattedWethBalance = wethBalance
    ? formatEthBalance(wethBalance?.balance)
    : "0";

  if (!active) {
    return null;
  }

  return (
    <div
      className={classNames(
        { [styles.sideBarDark]: isDarkMode },
        tw(
          "flex",
          "flex-col",
          "pt-10",
          "pr-12",
          "lg:pr-16",
          "space-y-8",
          "flex-1"
        )
      )}
    >
      {account && (
        <Card className={classNames(tw("flex", "flex-col"))} interactive>
          <div
            className={tw(
              "flex",
              "justify-between",
              "items-center",
              "space-x-8"
            )}
          >
            <div
              className={classNames(tw("flex", "space-x-4", "items-center"))}
            >
              {/* TODO: use a Blockies or jazzicon here */}
              <div
                style={{
                  height: 48,
                  width: 48,
                  borderRadius: "50%",
                  borderColor: "white",
                  borderWidth: 1,
                  backgroundColor: "black",
                  flexShrink: 0,
                }}
              />

              <div className={tw("flex", "flex-col")}>
                <div className={tw("flex", "items-center", "justify-between")}>
                  <span className={classNames(Classes.TEXT_LARGE)}>
                    {formatWalletAddress(account)}
                  </span>
                </div>
                <div className={tw("flex", "items-center", "justify-between")}>
                  <span className={classNames(Classes.TEXT_MUTED)}>
                    {formatChainName(active, chainId)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

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
      <Card interactive className={tw("flex", "flex-col")}>
        <NonIdealState
          className={tw("pb-5")}
          icon={
            <Icon icon={IconNames.CUBE_ADD} iconSize={Icon.SIZE_LARGE * 3} />
          }
          description={
            <span className={Classes.TEXT_MUTED}>{t`Add a Strategy`}</span>
          }
        ></NonIdealState>
      </Card>
    </div>
  );
};

export default WalletSummaryPane;
