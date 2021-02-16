import React, { FC } from "react";

import { Card, Classes, H2 } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { RouteComponentProps } from "@reach/router";
import { useWeb3React } from "@web3-react/core";
import classNames from "classnames";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { MarketFilterOptions } from "efi-ui/markets/MarketFilterOptions/MarketFilterOptions";
import { MarketsTable } from "efi-ui/markets/MarketsTable/MarketsTable";
import { useMarketContracts } from "efi-ui/markets/useMarketContracts";
import { WalletConnectionCard } from "efi-ui/wallets/WalletConnectionCard/WalletConnectionCard";
import { stubbedMarkets } from "efi/markets/stubbedMarkets";
import { getConnectorName } from "efi/wallets/connectors";

interface ExchangeViewProps extends RouteComponentProps {}

export const ExchangeView: FC<ExchangeViewProps> = () => {
  const {
    active,
    account,
    chainId,
    connector,
    library,
  } = useWeb3React<Web3Provider>();
  const connectorName = getConnectorName(connector, library);
  const marketContracts = useMarketContracts();

  return (
    <div
      data-testid="exchange-view"
      className={tw("flex", "p-12", "h-full", "space-x-12", "overflow-scroll")}
    >
      {/* Main content */}
      <div className={tw("flex", "flex-col", "flex-1", "space-y-12")}>
        {/* page title */}
        <div className={tw("flex", "justify-between")}>
          <div className={tw("flex", "flex-col", "justify-start")}>
            <H2 className={tw("mb-4")}>{t`Element Exchange`}</H2>
            <span
              className={classNames(
                Classes.RUNNING_TEXT,
                Classes.TEXT_MUTED,
                tw("text-base")
              )}
            >{t`Provide liquidity for this market, or trade for what you want.`}</span>
          </div>
          <WalletConnectionCard
            active={active}
            account={account}
            chainId={chainId}
            connectorName={connectorName}
          />
        </div>

        <div className={tw("flex", "space-x-12")}>
          {/* Right hand side */}
          <div
            className={tw(
              "hidden",
              "lg:block",
              "h-full",
              "flex-shrink-0",
              "w-64"
            )}
          >
            <MarketFilterOptions />
          </div>
          <div className={tw("flex", "flex-1")}>
            <Card className={tw("p-10", "flex", "flex-1")}>
              <MarketsTable
                className={tw("w-full")}
                marketContracts={marketContracts}
                markets={stubbedMarkets}
              />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
