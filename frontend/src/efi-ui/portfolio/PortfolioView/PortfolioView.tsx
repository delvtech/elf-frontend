import { FC, useCallback, useState } from "react";

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
import { formatWalletAddress } from "efi/wallets/formatWalletAddress";

import { usePortfolioTabs } from "../PortfolioTabs/usePortfolioTabs";

interface PortfolioViewProps extends RouteComponentProps {}

export const PortfolioView: FC<PortfolioViewProps> = () => {
  const { account, library } = useWeb3React<Web3Provider>();

  const portfolioTabs: PortfolioTab[] = usePortfolioTabs(library, account);

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
    <div
      data-testid="portfolio-view"
      className={tw("flex", "p-12", "h-full", "space-x-12", "overflow-scroll")}
    >
      {/* Main content */}
      <div className={tw("flex", "flex-col", "flex-1", "space-y-12")}>
        <div className={tw("flex", "flex-col", "w-full", "space-y-12")}>
          <div>
            <H2>
              {t`Portfolio `}{" "}
              {account ? (
                <span className={Classes.TEXT_MUTED}>{`(${formatWalletAddress(
                  account
                )})`}</span>
              ) : null}
            </H2>
          </div>
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
  );
};
