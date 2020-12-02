import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import classNames from "classnames";
import React, { FunctionComponent } from "react";

import tw from "efi-tailwindcss-classnames";
import { useDarkMode } from "efi/ui/prefs/useDarkMode/useDarkMode";
import styles from "efi/ui/wallets/WalletSummaryPane/WalletSummaryPane.module.css";
import { WalletConnectionCard } from "efi/ui/wallets/WalletConnectionCard/WalletConnectionCard";
import WalletBalancesCard from "efi/ui/wallets/WalletBalancesCard/WalletBalancesCard";

interface WalletSummaryPaneProps {}

export const WalletSummaryPane: FunctionComponent<WalletSummaryPaneProps> = () => {
  const { active, account, chainId } = useWeb3React<Web3Provider>();
  const { isDarkMode } = useDarkMode();

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
      <WalletConnectionCard
        active={active}
        account={account}
        chainId={chainId}
      />

      <WalletBalancesCard />
    </div>
  );
};

export default WalletSummaryPane;
