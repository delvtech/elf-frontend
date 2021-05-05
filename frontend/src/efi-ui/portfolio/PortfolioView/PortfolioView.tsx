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

import styles from "./styles.module.css";

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
          "pt-32",
          "lg:pt-12",
          "h-full",
          "space-x-12",
          "items-center",
          "overflow-scroll"
        )}
      >
        {/* Main content */}
        <div
          className={tw("flex", "flex-col", "h-full", "flex-1", "items-center")}
        >
          <div
            className={tw(
              "flex",
              "flex-col",
              "w-full",
              "space-y-2",
              "items-center",
              "mb-6"
            )}
          >
            {account ? (
              <H2 className={tw("text-center")}>
                {t`Portfolio `}{" "}
                <a
                  className={styles.accountLink}
                  href={`https://etherscan.io/address/${account}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className={Classes.TEXT_MUTED}>{`(${formatWalletAddress(
                    account
                  )})`}</span>
                </a>
              </H2>
            ) : null}

            {account ? (
              <PortfolioTabs
                onChangeTab={onChangeTab}
                activePortfolioTabId={activePortfolioTabId}
                portfolioTabs={portfolioTabs}
              />
            ) : null}
          </div>

          <div className={tw("flex", "w-full", "h-full")}>
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
    </Fragment>
  );
}
