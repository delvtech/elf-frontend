import React, { CSSProperties, FC, useCallback } from "react";

import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";

import { ReactComponent as CoinbaseWalletIcon } from "efi-static-assets/logos/coinbasewallet.svg";
import { ReactComponent as FortmaticIcon } from "efi-static-assets/logos/fortmatic.svg";
import { ReactComponent as LedgerIcon } from "efi-static-assets/logos/ledgerIcon.svg";
import { ReactComponent as MetamaskIcon } from "efi-static-assets/logos/metamask.svg";
import { ReactComponent as TorusIcon } from "efi-static-assets/logos/torus.svg";
import { ReactComponent as WalletConnectIcon } from "efi-static-assets/logos/walletConnectIcon.svg";
import tw from "efi-tailwindcss-classnames";
import { ConnectWalletButton } from "efi-ui/wallets/ConnectWalletButton/ConnectWalletButton";
import {
  fortmaticConnector,
  injectedConnector,
  ledgerConnector,
  torusConnector,
  walletConnectConnector,
  walletLinkConnector,
} from "efi/wallets/connectors";

const iconStyle: CSSProperties = {
  height: 24,
  width: 24,
};

export const ConnectWalletButtons: FC<{}> = () => {
  const { active, activate, deactivate } = useWeb3React<Web3Provider>();

  const deactivateActiveConnector = useCallback(async () => {
    if (active) {
      await deactivate();
    }
  }, [active, deactivate]);

  const connectToMetaMask = useCallback(async () => {
    await deactivateActiveConnector();
    activate(injectedConnector, deactivateActiveConnector);
  }, [activate, deactivateActiveConnector]);

  const connectToWalletConnect = useCallback(async () => {
    await deactivateActiveConnector();
    activate(walletConnectConnector, deactivateActiveConnector);
  }, [activate, deactivateActiveConnector]);

  const connectToWalletLink = useCallback(async () => {
    await deactivateActiveConnector();
    activate(walletLinkConnector, deactivateActiveConnector);
  }, [activate, deactivateActiveConnector]);

  const connectToFortmatic = useCallback(async () => {
    await deactivateActiveConnector();
    activate(fortmaticConnector, deactivateActiveConnector);
  }, [activate, deactivateActiveConnector]);

  // TODO: test this.  Need to add a U2F (i.e. Fido once we can connect a hardware wallet)
  const connectToLedger = useCallback(async () => {
    await deactivateActiveConnector();
    activate(ledgerConnector);
  }, [activate, deactivateActiveConnector]);

  const connectToTorus = useCallback(() => {
    torusConnector.deactivate();
    activate(torusConnector, deactivateActiveConnector);
  }, [activate, deactivateActiveConnector]);

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
      <ConnectWalletButton
        icon={
          <div className={tw("bg-white", "rounded", "p-1")}>
            <LedgerIcon style={iconStyle} />
          </div>
        }
        name="Ledger"
        onClick={connectToLedger}
      />
      <ConnectWalletButton
        icon={<FortmaticIcon style={iconStyle} />}
        name="Fortmatic"
        onClick={connectToFortmatic}
      />
    </div>
  );
};
