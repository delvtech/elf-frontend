import React, { FC, useState } from "react";

import { Card, Classes, H2, Tab, Tabs } from "@blueprintjs/core";
import { RouteComponentProps } from "@reach/router";
import classNames from "classnames";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { MarketFilterOptions } from "efi-ui/markets/MarketFilterOptions/MarketFilterOptions";
import { MarketsTable } from "efi-ui/markets/MarketsTable/MarketsTable";
import { ElfStrategyHighRisk } from "efi/pools/highRisk";
import { ElfStrategyLowRisk } from "efi/pools/lowRisk";
import { ElfStrategyMediumRisk } from "efi/pools/mediumRisk";
import { Pool } from "efi/pools/Pool";
import { WalletConnectionCard } from "efi-ui/wallets/WalletConnectionCard/WalletConnectionCard";
import { useWeb3React } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";
import { getConnectorName } from "efi/wallets/connectors";

interface ExchangeViewProps extends RouteComponentProps {}

type ExchangeTabs = "markets" | "tranches";

// TODO: change this to a list of Markets
const availableMarkets: Pool[] = [
  ElfStrategyLowRisk,
  ElfStrategyMediumRisk,
  ElfStrategyHighRisk,
];

export const ExchangeView: FC<ExchangeViewProps> = () => {
  const {
    active,
    account,
    chainId,
    connector,
    library,
  } = useWeb3React<Web3Provider>();
  const [selectedTabId, setSelectedTabId] = useState<ExchangeTabs>("markets");

  const connectorName = getConnectorName(connector, library);

  return (
    <div
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
            <Tabs
              onChange={setSelectedTabId as any}
              selectedTabId={selectedTabId}
            >
              <Tab
                id="markets"
                title={<span className="h2">{t`Markets`}</span>}
                panel={
                  <Card className={tw("p-10", "flex", "flex-1")}>
                    <MarketsTable
                      className={tw("w-full")}
                      markets={availableMarkets}
                    />
                  </Card>
                }
              />
              <Tab
                id="tranches"
                title={<span className="h2">{t`Tranches`}</span>}
                panel={
                  <Card className={tw("p-10", "flex", "flex-1")}>
                    <MarketsTable
                      className={tw("w-full")}
                      markets={availableMarkets}
                    />
                  </Card>
                }
              />
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};
