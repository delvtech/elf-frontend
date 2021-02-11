import React, { FC } from "react";

import { Classes, H2 } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { RouteComponentProps } from "@reach/router";
import { useWeb3React } from "@web3-react/core";
import classNames from "classnames";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { MarketDetails } from "efi-ui/markets/MarketDetails/MarketDetails";
import { WalletConnectionCard } from "efi-ui/wallets/WalletConnectionCard/WalletConnectionCard";
import { getConnectorName } from "efi/wallets/connectors";
import { stubbedMarkets } from "efi/markets/stubbedMarkets";

interface MarketViewProps extends RouteComponentProps {}

export const MarketView: FC<MarketViewProps> = () => {
  const {
    active,
    account,
    chainId,
    connector,
    library,
  } = useWeb3React<Web3Provider>();

  const connectorName = getConnectorName(connector, library);
  return (
    <div
      data-testid="market-view"
      className={tw("flex", "p-12", "h-full", "space-x-12", "overflow-scroll")}
    >
      {/* Main content */}
      <div className={tw("flex", "flex-col", "flex-1", "space-y-8")}>
        {/* page title */}
        <div className={tw("flex", "justify-between")}>
          <div className={tw("flex", "flex-col", "justify-start")}>
            <H2 className={tw("mb-4")}>{t`ETH - fyETH Market`}</H2>
            <span
              className={classNames(
                Classes.RUNNING_TEXT,
                Classes.TEXT_MUTED,
                tw("text-base")
              )}
            >{t`Trade for either asset or provide liquidity for this market.`}</span>
          </div>
          <WalletConnectionCard
            active={active}
            account={account}
            chainId={chainId}
            connectorName={connectorName}
          />
        </div>
        <div className={tw("flex", "flex-col", "justify-between")}>
          <MarketDetails market={stubbedMarkets[0]} />
        </div>
      </div>
    </div>
  );
};
