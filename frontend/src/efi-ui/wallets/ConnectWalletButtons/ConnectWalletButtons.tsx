import React, { CSSProperties, ReactElement, useCallback } from "react";

import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";

import { ReactComponent as MetamaskIcon } from "efi-static-assets/logos/metamask.svg";
import { ReactComponent as WalletConnectIcon } from "efi-static-assets/logos/walletConnectIcon.svg";
import tw from "efi-tailwindcss-classnames";
import {
  injectedConnector,
  walletConnectConnector,
} from "efi/wallets/connectors";
import { Button, ButtonGroup } from "@blueprintjs/core";

const iconStyle: CSSProperties = {
  height: 48,
  width: 48,
};

interface ConnectWalletButtonsProps {
  vertical?: boolean;
  onClick?: () => void;
}

export function ConnectWalletButtons({
  vertical,
  onClick,
}: ConnectWalletButtonsProps): ReactElement {
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
      <ButtonGroup fill>
        <Button
          minimal
          className={tw("p-12", "w-1/2", "flex-col", "space-y-3")}
          onClick={connectToMetaMask}
          icon={<MetamaskIcon style={iconStyle} />}
        >
          <span className={tw("text-base")}>MetaMask</span>
        </Button>
        <Button
          minimal
          className={tw("p-12", "w-1/2", "flex-col", "space-y-3")}
          onClick={connectToWalletConnect}
          icon={<WalletConnectIcon style={iconStyle} />}
        >
          <span className={tw("text-base")}>WalletConnect</span>
        </Button>
      </ButtonGroup>
    </div>
  );
}
