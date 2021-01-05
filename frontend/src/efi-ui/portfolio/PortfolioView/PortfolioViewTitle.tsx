import React, { FC, Fragment, useCallback, useState } from "react";

import { Classes, Colors, H2 } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { AbstractConnector } from "@web3-react/abstract-connector";
import classNames from "classnames";
import { jt, t } from "ttag";

import { makeEtherscanWalletAddressUrl } from "efi-etherscan/makeEtherscanWalletLink";
import tw from "efi-tailwindcss-classnames";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { ConnectWalletDialog } from "efi-ui/wallets/ConnectWalletDialog/ConnectWalletDialog";
import { WalletConnectionCard } from "efi-ui/wallets/WalletConnectionCard/WalletConnectionCard";
import { getConnectorName } from "efi/wallets/connectors";

interface PortfolioViewTitleProps {
  account: string | null | undefined;
  active: boolean;
  chainId: number | undefined;
  connector: AbstractConnector | undefined;
  library: Web3Provider | undefined;
}

export const PortfolioViewTitle: FC<PortfolioViewTitleProps> = ({
  account,
  active,
  chainId,
  connector,
  library,
}) => {
  const connectorName = getConnectorName(connector, library);
  return (
    <div className={tw("flex", "justify-between")}>
      <div className={tw("flex", "flex-col", "justify-start", "flex-1")}>
        <H2 className={tw("mb-4")}>{t`Portfolio`}</H2>
        <PortfolioViewSubtitle account={account} />
      </div>

      <div className={tw("flex")}>
        <WalletConnectionCard
          className={tw("flex")}
          account={account}
          active={active}
          chainId={chainId}
          connectorName={connectorName}
        />
      </div>
    </div>
  );
};

interface PortfolioViewSubtitleProps {
  account: string | null | undefined;
}

const subtitleClassName = classNames(
  Classes.RUNNING_TEXT,
  Classes.TEXT_MUTED,
  tw("text-base")
);

const PortfolioViewSubtitle: FC<PortfolioViewSubtitleProps> = ({ account }) => {
  const { isDarkMode } = useDarkMode();
  const [isDialogOpen, setDialogOpen] = useState(false);
  const openDialog = useCallback(() => setDialogOpen(true), []);
  const closeDialog = useCallback(() => setDialogOpen(false), []);

  if (account) {
    const walletEtherscanLink = (
      <a
        key={account}
        href={makeEtherscanWalletAddressUrl(account)}
        target="_blank"
        rel="noreferrer"
      >
        {account}
      </a>
    );

    // TODO: make it easy to copy the address to the clipboard here..

    return (
      <span className={subtitleClassName}>
        {jt`Wallet address: ${walletEtherscanLink}`}
      </span>
    );
  }

  return (
    <Fragment>
      <span className={subtitleClassName}>
        <span>
          {t`View your balances and interest earnings.`}{" "}
          <button
            onClick={openDialog}
            className={classNames(Classes.BUTTON_TEXT, Classes.TEXT_LARGE)}
            style={{ color: isDarkMode ? Colors.BLUE5 : Colors.BLUE2 }}
          >
            {t`Connect a wallet to begin.`}
          </button>
        </span>
      </span>
      <ConnectWalletDialog isOpen={isDialogOpen} onClose={closeDialog} />
    </Fragment>
  );
};
