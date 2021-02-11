import { Button, Classes, Colors, Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import classNames from "classnames";
import React, { CSSProperties, Fragment, FunctionComponent } from "react";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { useWallet } from "efi-ui/graveyard/useWallet";
import { useWalletBalances } from "efi-ui/graveyard/useWalletBalance";
import { formatChainName } from "efi/crypto/formatChainName";
import { formatEthBalance } from "efi/crypto/formatEthBalance";
import { formatMoney } from "efi/money/formatMoney";
import { getConnectorName } from "efi/wallets/connectors";
import { formatWalletAddress } from "efi/wallets/formatWalletAddress";

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
  const {
    deactivate,
    chainId,
    account,
    active,
    connector,
    library,
  } = useWeb3React<Web3Provider>();
  const { isDarkMode } = useDarkMode();

  const { fiatBalance } = useWallet();
  const [balances] = useWalletBalances();
  const ethBalance = balances.ETH?.value;
  const wethBalance = balances.WETH?.value;

  const formattedEthBalance = ethBalance ? formatEthBalance(ethBalance) : "0";

  const formattedWethBalance = wethBalance
    ? formatEthBalance(wethBalance)
    : "0";

  const currencyInfo = fiatBalance?.getCurrencyInfo();

  const connectorName = getConnectorName(connector, library);

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
        <Fragment>
          <div className={rowClassName}>
            <span className={labelClassName}>{t`Chain`}</span>
            <span
              className={classNames(tw("flex", "items-center", "space-x-1"))}
            >
              <span>{formatChainName(active, chainId)}</span>
            </span>
          </div>
          <div className={rowClassName}>
            <span className={labelClassName}>{t`Connector`}</span>
            <span
              className={classNames(tw("flex", "items-center", "space-x-1"))}
            >
              <span>{connectorName}</span>
            </span>
          </div>
        </Fragment>
      )}
      {account && (
        <div className={rowClassName}>
          <span className={labelClassName}>{t`Wallet address`}</span>
          <button
            className={classNames("bp3-button", "bp3-minimal", "bp3-outlined")}
            onClick={active ? deactivate : () => {}}
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
                className={tw("flex-shrink-0")}
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
      {ethBalance && (
        <div className={rowClassName}>
          <span className={labelClassName}>{t`Available balance`}</span>
          <span>{t`${formattedEthBalance} ETH`}</span>
        </div>
      )}
      {wethBalance && (
        <div className={rowClassName}>
          <span className={labelClassName}>{t`Available balance (WETH)`}</span>
          <span>{t`${formattedWethBalance}`}</span>
        </div>
      )}
      {!!fiatBalance && !!currencyInfo && (
        <div className={rowClassName}>
          <span
            className={labelClassName}
          >{t`Available balance (${currencyInfo.code})`}</span>
          <span>{`${formatMoney(fiatBalance)} (${
            currencyInfo.symbol_native || currencyInfo.symbol
          })`}</span>
        </div>
      )}
    </div>
  );
};

export default WalletSummary;
