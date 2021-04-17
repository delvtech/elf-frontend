import React, { Fragment, ReactElement, useCallback, useState } from "react";
import { Helmet } from "react-helmet";

import { Classes, H2 } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { RouteComponentProps } from "@reach/router";
import { useWeb3React } from "@web3-react/core";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import {
  PortfolioTab,
  PortfolioTabs,
} from "efi-ui/portfolio/PortfolioTabs/PortfolioTabs";
import { usePortfolioTabs } from "efi-ui/portfolio/PortfolioTabs/usePortfolioTabs";
import { formatWalletAddress } from "efi/wallets/formatWalletAddress";

interface PortfolioViewProps extends RouteComponentProps {}

export function PortfolioView(props: PortfolioViewProps): ReactElement {
  const {
    account,
    library,
    active,
    chainId,
    connector,
  } = useWeb3React<Web3Provider>();

  const portfolioTabs: PortfolioTab[] = usePortfolioTabs(
    chainId,
    library,
    connector,
    active,
    account
  );

  const [activePortfolioTabId, setActivePortfolioTab] = useState(
    portfolioTabs[0].id
  );

  const activeTab = portfolioTabs.find(
    ({ id }) => activePortfolioTabId === id
  ) as PortfolioTab;

  const { contentRenderer } = activeTab;
  const activeTabContent = contentRenderer(activeTab);

  const onChangeTab = useCallback((tabId: string) => {
    setActivePortfolioTab(tabId);
  }, []);

  return (
    <Fragment>
      <Helmet>
        <title>{t`Portfolio`}</title>
      </Helmet>
      <div
        data-testid="portfolio-view"
        className={tw(
          "flex",
          "p-12",
          "h-full",
          "space-x-12",
          "overflow-scroll"
        )}
      >
        {/* Main content */}
        <div className={tw("flex", "flex-col", "flex-1", "space-y-12")}>
          <div className={tw("flex", "flex-col", "w-full", "space-y-8")}>
            <H2 className={tw("text-center")}>
              {t`Portfolio `}{" "}
              {account ? (
                <span className={Classes.TEXT_MUTED}>{`(${formatWalletAddress(
                  account
                )})`}</span>
              ) : null}
            </H2>
            <PortfolioTabs
              onChangeTab={onChangeTab}
              activePortfolioTabId={activePortfolioTabId}
              portfolioTabs={portfolioTabs}
            />
          </div>

          <div className={tw("flex", "w-full", "h-full", "space-x-10")}>
            <div className={tw("flex", "flex-col", "w-full")}>
              <div
                className={tw(
                  "h-full",
                  "w-full",
                  "flex",
                  "flex-col",
                  "space-y-10",
                  "lg:flex-row",
                  "lg:space-y-0",
                  "lg:space-x-10"
                )}
              >
                <div className={tw("flex", "flex-1", "w-full")}>
                  {activeTabContent}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
}
