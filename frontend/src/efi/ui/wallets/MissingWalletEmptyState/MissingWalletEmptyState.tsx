import React, { CSSProperties, FC, useCallback } from "react";

import { Intent, NonIdealState, Tag } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import classNames from "classnames";
import { jt, t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { ReactComponent as CoinbaseWalletIcon } from "efi/ui/staticAssets/logos/coinbaseWalletIcon.svg";
import { ReactComponent as FortmaticIcon } from "efi/ui/staticAssets/logos/fortmatic.svg";
import { ReactComponent as LedgerIcon } from "efi/ui/staticAssets/logos/ledgerIcon.svg";
import { ReactComponent as MetamaskIcon } from "efi/ui/staticAssets/logos/metamask.svg";
import { ReactComponent as TorusIcon } from "efi/ui/staticAssets/logos/torus.svg";
import { ReactComponent as WalletConnectIcon } from "efi/ui/staticAssets/logos/walletConnectIcon.svg";
import { ConnectWalletButton } from "efi/ui/wallets/hooks/WalletConnectButton/WalletConnectButton";
import { injectedConnector } from "efi/wallets/connectors";

const iconStyle: CSSProperties = {
  height: 24,
  width: 24,
};

const betaTag = (
  <Tag key="beta-tag" minimal intent={Intent.WARNING}>
    {t`BETA`}
  </Tag>
);

const howItWorksLink = (
  <a key="how-it-work" href="/">{t`how investing works`}</a>
);

export const MissingWalletEmptyState: FC<{}> = () => {
  const { activate } = useWeb3React<Web3Provider>();

  // TODO: Make our own modal w/ buttons for all the different wallet connectors
  const connectToMetaMask = useCallback(() => activate(injectedConnector), [
    activate,
  ]);

  return (
    <NonIdealState
      icon={IconNames.SEND_TO_GRAPH}
      title={t`No wallet connected.`}
      className={tw("max-w-full")}
      description={
        <div
          className={classNames(
            tw(
              "md:text-left",
              "flex",
              "flex-col",
              "justify-center",
              "items-center",
              "gap-y-5"
            )
          )}
        >
          <span>{t`Connecting your wallet lets Element.fi do a few things:`}</span>
          <ul className={tw("w-9/12", "list-disc", "text-left")}>
            <li className={tw("mb-3")}>
              {t`View and display your crypto balances`}
            </li>
            <li>{t`Initialize Ethereum transactions on your behalf`}</li>
          </ul>
        </div>
      }
      action={
        <div
          className={tw(
            "p-8",
            "grid",
            "grid-cols-1",
            "md:grid-cols-2",
            "lg:grid-cols-3",
            "gap-2",
            "w-3/4",
            "max-w-full"
          )}
        >
          <ConnectWalletButton
            icon={<MetamaskIcon style={iconStyle} />}
            name="Metamask"
            onClick={connectToMetaMask}
          />
          <ConnectWalletButton
            icon={<WalletConnectIcon style={iconStyle} />}
            name="WalletConnect"
            onClick={connectToMetaMask}
          />
          <ConnectWalletButton
            icon={<CoinbaseWalletIcon style={iconStyle} />}
            name="Coinbase"
            onClick={connectToMetaMask}
          />
          <ConnectWalletButton
            icon={<TorusIcon style={iconStyle} />}
            name="Torus"
            onClick={connectToMetaMask}
          />
          <ConnectWalletButton
            icon={
              <div className={tw("bg-white", "rounded", "p-1")}>
                <LedgerIcon style={iconStyle} />
              </div>
            }
            name="Ledger"
            onClick={connectToMetaMask}
          />
          <ConnectWalletButton
            icon={<FortmaticIcon style={iconStyle} />}
            name="Fortmatic"
            onClick={connectToMetaMask}
          />
        </div>
      }
    >
      <div className={tw("pt-32")}>
        <p className={tw("pb-4")}>{jt`Element is currently in ${betaTag}.`}</p>
        <p>{jt`Read more about ${howItWorksLink}.`}</p>
      </div>
    </NonIdealState>
  );
};
