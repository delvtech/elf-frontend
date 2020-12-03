import React, { CSSProperties, FC, useCallback } from "react";

import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";

import { ReactComponent as CoinbaseWalletIcon } from "efi-static-assets/logos/coinbasewallet.svg";
import { ReactComponent as FortmaticIcon } from "efi-static-assets/logos/fortmatic.svg";
// import { ReactComponent as LedgerIcon } from "efi-static-assets/logos/ledgerIcon.svg";
import { ReactComponent as MetamaskIcon } from "efi-static-assets/logos/metamask.svg";
import { ReactComponent as TorusIcon } from "efi-static-assets/logos/torus.svg";
import { ReactComponent as WalletConnectIcon } from "efi-static-assets/logos/walletConnectIcon.svg";
import tw from "efi-tailwindcss-classnames";
import { ConnectWalletButton } from "efi-ui/wallets/ConnectWalletButton/ConnectWalletButton";
import {
  fortmaticConnector,
  injectedConnector,
  torusConnector,
  walletConnectConnector,
  walletLinkConnector,
} from "efi/wallets/connectors";

const iconStyle: CSSProperties = {
  height: 24,
  width: 24,
};

export const ConnectWalletButtons: FC<{}> = () => {
  const { activate } = useWeb3React<Web3Provider>();

  const connectToMetaMask = useCallback(() => activate(injectedConnector), [
    activate,
  ]);

  // TODO: fix reactivate problem when user closes QR code without connecting
  const connectToWalletConnect = useCallback(
    () => activate(walletConnectConnector),
    [activate]
  );

  // TODO: fix reactivate problem when user closes QR code without connecting
  const connectToWalletLink = useCallback(() => activate(walletLinkConnector), [
    activate,
  ]);

  const connectToFortmatic = useCallback(() => activate(fortmaticConnector), [
    activate,
  ]);

  // TODO: test this.  Need to add a U2F (i.e. Fido once we can connect a hardware wallet)
  // const connectToLedger = useCallback(() => activate(ledgerConnector), [
  //   activate,
  // ]);

  const connectToTorus = useCallback(() => activate(torusConnector), [
    activate,
  ]);

  return (
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
        onClick={connectToWalletConnect}
      />
      <ConnectWalletButton
        iconClassName={tw("rounded", "overflow-hidden")}
        icon={<CoinbaseWalletIcon style={iconStyle} />}
        name="Coinbase"
        onClick={connectToWalletLink}
      />
      <ConnectWalletButton
        icon={<TorusIcon style={iconStyle} />}
        name="Torus"
        onClick={connectToTorus}
      />
      {/* <ConnectWalletButton
        icon={
          <div className={tw("bg-white", "rounded", "p-1")}>
            <LedgerIcon style={iconStyle} />
          </div>
        }
        name="Ledger"
        onClick={connectToLedger}
      /> */}
      <ConnectWalletButton
        icon={<FortmaticIcon style={iconStyle} />}
        name="Fortmatic"
        onClick={connectToFortmatic}
      />
    </div>
  );
};
