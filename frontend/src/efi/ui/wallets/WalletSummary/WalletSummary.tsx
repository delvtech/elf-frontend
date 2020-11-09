import React, { CSSProperties, FunctionComponent, useCallback } from "react";

import { Button, Classes, Colors, Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Web3Provider } from "@ethersproject/providers";
import { formatEther } from "@ethersproject/units";
import { useWeb3React } from "@web3-react/core";
import classNames from "classnames";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { CryptoSymbol } from "efi/crypto/CryptoSymbol";
import { formatChainName } from "efi/ui/crypto/formatChainName";
import { formatEthBalance } from "efi/ui/crypto/formatEthBalance";
import { useCryptoPrice } from "efi/ui/crypto/hooks/useCryptoPrice/useCryptoPrice";
import { useDarkMode } from "efi/ui/prefs/useDarkMode/useDarkMode";
import { formatWalletAddress } from "efi/ui/wallets/formatWalletAddress";
import { useWallet } from "efi/ui/wallets/hooks/useWallet";
import { injectedConnector } from "efi/wallets/connectors";

interface WalletSummaryProps {}

const rowClassName = tw(
  "flex",
  "flex-1",
  "space-x-4",
  "justify-between",
  "items-center"
);
const labelClassName = classNames(Classes.TEXT_MUTED);
export const WalletSummary: FunctionComponent<WalletSummaryProps> = () => {
  const { ethBalance } = useWallet();

  const { data: ethPrice } = useCryptoPrice(CryptoSymbol.ETH);

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

  let balanceUSD: number | undefined;
  if (ethPrice && ethBalance) {
    balanceUSD = ethPrice * +formatEther(ethBalance);
  }

  if (!active) {
    return (
      <div style={walletSummaryStyle} className={tw("space-y-2")}>
        <Button
          icon={<Icon icon={IconNames.GLOBE_NETWORK} />}
          minimal
          fill
          className={tw("py-8")}
          onClick={active ? deactivate : () => {}}
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
          <button
            className={classNames("bp3-button", "bp3-minimal", "bp3-outlined")}
            onClick={active ? deactivate : connectToInjectedWallet}
          >
            <div
              className={tw(
                "flex",
                "content-center",
                "space-x-1",
                "w-full",
                "items-center"
              )}
            >
              <Icon
                className={tw("flex-shrink-0", "block")}
                icon={IconNames.DOT}
                color={account ? Colors.GREEN4 : Colors.RED4}
              />
              <div className={tw("flex", "flex-shrink", "truncate")}>
                {formatWalletAddress(account)}
              </div>
              <Icon
                className={tw("flex-shrink-0", "flex", "items-center")}
                icon={IconNames.CROSS}
                iconSize={12}
              />
            </div>
          </button>
        </div>
      )}

      {ethBalance !== undefined && (
        <div className={rowClassName}>
          <span className={labelClassName}>{t`Available balance`}</span>
          <span>{t`${formatEthBalance(ethBalance)} ETH`}</span>
        </div>
      )}

      {balanceUSD !== undefined && (
        <div className={rowClassName}>
          <span className={labelClassName}>{t`Available balance (USD)`}</span>
          <span>{t`$${(+balanceUSD.toFixed(2)).toLocaleString()} `}</span>
        </div>
      )}
    </div>
  );
};

export default WalletSummary;
