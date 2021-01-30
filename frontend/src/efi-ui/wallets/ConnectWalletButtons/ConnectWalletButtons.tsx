import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import React, { CSSProperties, FC, useCallback } from "react";

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
  torusConnector,
  walletConnectConnector,
  walletLinkConnector,
} from "efi/wallets/connectors";

const iconStyle: CSSProperties = {
  height: 24,
  width: 24,
};

interface ConnectWalletButtonsProps {
  fill?: boolean;
  vertical?: boolean;
  onClick?: () => void;
}

export const ConnectWalletButtons: FC<ConnectWalletButtonsProps> = ({
  fill,
  vertical,
  onClick,
}) => {
  const { active, activate, deactivate } = useWeb3React<Web3Provider>();

  const deactivateActiveConnector = useCallback(async () => {
    if (active) {
      await deactivate();
    }
  }, [active, deactivate]);

  const connectToMetaMask = useCallback(async () => {
    await deactivateActiveConnector();
    activate(injectedConnector, deactivateActiveConnector);
    onClick?.();
  }, [activate, deactivateActiveConnector, onClick]);

  const connectToWalletConnect = useCallback(async () => {
    await deactivateActiveConnector();
    activate(walletConnectConnector, deactivateActiveConnector);
    onClick?.();
  }, [activate, deactivateActiveConnector, onClick]);

  const connectToWalletLink = useCallback(async () => {
    await deactivateActiveConnector();
    activate(walletLinkConnector, deactivateActiveConnector);
    onClick?.();
  }, [activate, deactivateActiveConnector, onClick]);

  const connectToFortmatic = useCallback(async () => {
    await deactivateActiveConnector();
    activate(fortmaticConnector, deactivateActiveConnector);
    onClick?.();
  }, [activate, deactivateActiveConnector, onClick]);

  // TODO: fix this.  LedgerConnector package creates an error in our github actions:
  // npm ERR! Error while executing:
  // npm ERR! /usr/bin/git ls-remote -h -t ssh://git@github.com/ethereumjs/ethereumjs-abi.git
  // npm ERR!
  // npm ERR! Warning: Permanently added the RSA host key for IP address '140.82.114.4' to the list of known hosts.
  // npm ERR! git@github.com: Permission denied (publickey).
  // npm ERR! fatal: Could not read from remote repository.
  const connectToLedger = useCallback(async () => {
    onClick?.();
  }, [onClick]);

  const connectToTorus = useCallback(() => {
    torusConnector.deactivate();
    activate(torusConnector, deactivateActiveConnector);
    onClick?.();
  }, [activate, deactivateActiveConnector, onClick]);

  return (
    <div
      data-testid="connect-wallet-buttons"
      className={tw(
        "flex",
        { "flex-col": vertical, "flex-wrap": !vertical },
        "h-full",
        "w-full",
        "justify-center"
      )}
    >
      <ConnectWalletButton
        fill={fill}
        icon={<MetamaskIcon style={iconStyle} />}
        name="Metamask"
        onClick={connectToMetaMask}
      />
      <ConnectWalletButton
        fill={fill}
        icon={<WalletConnectIcon style={iconStyle} />}
        name="WalletConnect"
        onClick={connectToWalletConnect}
      />
      <ConnectWalletButton
        fill={fill}
        iconClassName={tw("rounded", "overflow-hidden")}
        icon={<CoinbaseWalletIcon style={iconStyle} />}
        name="Coinbase"
        onClick={connectToWalletLink}
      />
      <ConnectWalletButton
        fill={fill}
        icon={<TorusIcon style={iconStyle} />}
        name="Torus"
        onClick={connectToTorus}
      />
      <ConnectWalletButton
        fill={fill}
        icon={
          <div className={tw("bg-white", "rounded", "p-1")}>
            <LedgerIcon style={iconStyle} />
          </div>
        }
        name="Ledger"
        onClick={connectToLedger}
      />
      <ConnectWalletButton
        fill={fill}
        icon={<FortmaticIcon style={iconStyle} />}
        name="Fortmatic"
        onClick={connectToFortmatic}
      />
    </div>
  );
};
