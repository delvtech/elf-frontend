import React, { CSSProperties, FunctionComponent, useCallback } from "react";
import { Button, Classes, Colors, Icon } from "@blueprintjs/core";
import { t } from "ttag";
import { useWallet } from "efi/ui/wallets/hooks/useWallet";
import { formatEther } from "@ethersproject/units";
import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import { IconNames } from "@blueprintjs/icons";
import tw from "tailwindcss-classnames";
import classNames from "classnames";
import { ChainId, ChainNames } from "efi/crypto/ethereum";
import { useDarkMode } from "efi/ui/prefs/useDarkMode/useDarkMode";
import { BigNumber } from "ethers";
import { injectedConnector } from "efi/wallets/connectors";

interface WalletSummaryProps {}

const rowClassName = tw(
  "flex",
  "flex-1",
  "space-x-4",
  "justify-between",
  "items-center"
);
const labelClassName = classNames(Classes.TEXT_MUTED, tw("text-xs"));
export const WalletSummary: FunctionComponent<WalletSummaryProps> = () => {
  const { ethBalance } = useWallet();

  const { isDarkMode } = useDarkMode();

  const { deactivate, activate, chainId, account, active } = useWeb3React<
    Web3Provider
  >();

  const connectToInjectedWallet = useCallback(
    () => activate(injectedConnector),
    [activate]
  );

  const walletSummaryStyle: CSSProperties = {
    backgroundColor: isDarkMode ? Colors.DARK_GRAY4 : Colors.LIGHT_GRAY5,
  };

  if (!active) {
    return (
      <div style={walletSummaryStyle} className={tw("space-y-2")}>
        <Button
          icon={<Icon icon={IconNames.GLOBE_NETWORK} />}
          minimal
          fill
          className={tw("py-8")}
          onClick={active ? deactivate : connectToInjectedWallet}
        >
          {t`Connect your wallet`}
        </Button>
      </div>
    );
  }

  return (
    <div style={walletSummaryStyle} className={tw("p-8", "space-y-4")}>
      {active && (
        <div className={rowClassName}>
          <span className={labelClassName}>{t`Chain`}</span>
          <span className={classNames(tw("flex", "items-center", "space-x-1"))}>
            <span>{formatChainName(active, chainId)}</span>
          </span>
        </div>
      )}

      {account && (
        <div className={rowClassName}>
          <span className={labelClassName}>{t`Wallet address`}</span>
          <Button
            minimal
            outlined
            icon={
              <Icon
                icon={IconNames.DOT}
                color={account ? Colors.GREEN4 : Colors.RED4}
              />
            }
            rightIcon={<Icon icon={IconNames.CROSS} iconSize={12} />}
            onClick={active ? deactivate : connectToInjectedWallet}
          >
            {formatWalletAddress(account)}
          </Button>
        </div>
      )}

      {ethBalance !== undefined && (
        <div className={rowClassName}>
          <span className={labelClassName}>{t`Available balance`}</span>
          <span>{t`${formatEthBalance(ethBalance)} ETH`}</span>
        </div>
      )}
    </div>
  );
};

function formatWalletAddress(address: string): string {
  const hexPrefix = address.slice(0, 2);
  const firstFive = address.slice(2, 7); // after the 0x, take the first 5 uuniqu
  const lastFive = address.slice(-5);

  return `${hexPrefix}${firstFive}...${lastFive}`;
}

// Show eth in the format of xxxxxx.12345 place values after the decimal
function formatEthBalance(ethBalance: BigNumber | number): string {
  const ethBalanceString = formatEther(ethBalance);
  const decimalIndex = ethBalanceString.indexOf(".");
  if (decimalIndex > -1) {
    return ethBalanceString.slice(0, decimalIndex + 5);
  }
  return ethBalanceString;
}

function formatChainName(
  active: boolean,
  chainId: ChainId | undefined
): string {
  if (!active) {
    return t`Not connected`;
  }

  const chainName = chainId ? ChainNames[chainId as ChainId] : t`Unknown`;

  return chainName;
}

export default WalletSummary;
