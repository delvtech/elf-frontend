import { CSSProperties, ReactElement, useCallback } from "react";

import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";

import { ReactComponent as MetamaskIcon } from "efi-static-assets/logos/metamask.svg";
import { ReactComponent as WalletConnectIcon } from "efi-static-assets/logos/walletConnectIcon.svg";
import tw from "efi-tailwindcss-classnames";
import { ConnectWalletButton } from "efi-ui/wallets/ConnectWalletButton/ConnectWalletButton";
import {
  injectedConnector,
  walletConnectConnector,
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

export function ConnectWalletButtons({
  fill,
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
    </div>
  );
}
