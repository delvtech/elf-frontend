import React, { FC, useCallback, useState } from "react";

import { Web3Provider } from "@ethersproject/providers";
import { RouteComponentProps } from "@reach/router";
import { useWeb3React } from "@web3-react/core";
import classNames from "classnames";
import { Money } from "ts-money";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { ViewTitle } from "efi-ui/page/ViewTitle/ViewTitle";
import { FYTPortfolio } from "efi-ui/portfolio/FYTPortfolio/FYTPortfolio";
import { LiquidityPositionPortfolio } from "efi-ui/portfolio/LiquidityPositionPortfolio/LiquidityPositionPortfolio";
import {
  PortfolioTab,
  PortfolioTabs,
} from "efi-ui/portfolio/PortfolioTabs/PortfolioTabs";
import { PortfolioBalanceSummaryCard } from "efi-ui/portfolio/PortfolioView/PortfolioBalanceSummaryCard";
import { PortfolioViewSubtitle } from "efi-ui/portfolio/PortfolioView/PortfolioViewSubtitle";
import { YCPortfolio } from "efi-ui/portfolio/YCPortfolio/YCPortfolio";
import { useCurrencyPref } from "efi-ui/prefs/useCurrency/useCurencyPref";

import { useNumUniqueFYTsInWallet } from "../hooks/useNumUniqueFYTsInWallet";
import { useTotalFYTFiatBalance } from "../hooks/useTotalFYTFiatBalance";

interface PortfolioViewProps extends RouteComponentProps {}

export const PortfolioView: FC<PortfolioViewProps> = () => {
  const {
    account,
    active,
    chainId,
    connector,
    library,
  } = useWeb3React<Web3Provider>();

  const portfolioTabs: PortfolioTab[] = usePortfolioTabs(account);

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
        <ViewTitle
          title={t`Portfolio`}
          subtitle={<PortfolioViewSubtitle account={account} />}
          account={account}
          active={active}
          chainId={chainId}
          connector={connector}
          library={library}
        />

        <div className={tw("flex", "w-full", "h-full", "space-x-10")}>
          <div className={tw("flex", "flex-col", "w-full")}>
            <span className={classNames("h4", tw("mb-4"))}>{t`Assets`}</span>
            <div className={tw("flex", "space-x-10", "h-full", "w-full")}>
              {/* Left hand side */}
              <div className={tw("flex", "flex-col", "space-y-4", "w-400")}>
                <div className={tw("flex", "flex-1")}>
                  <div
                    className={tw(
                      "flex",
                      "flex-col",
                      "space-y-10",
                      "flex-1",
                      "justify-between"
                    )}
                  >
                    <PortfolioTabs
                      onChangeTab={onChangeTab}
                      activePortfolioTabId={activePortfolioTabId}
                      portfolioTabs={portfolioTabs}
                    />
                  </div>
                </div>

                <div className={tw("space-y-4")}>
                  <span className="h4">{t`Balance summary`}</span>
                  <PortfolioBalanceSummaryCard />
                </div>
              </div>
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

function usePortfolioTabs(account: string | null | undefined): PortfolioTab[] {
  const { currency } = useCurrencyPref();
  const { numFYTsInWallet, totalFiatValue: totalFYTFiatValue } = useFYTTab(
    account
  );

  return [
    {
      id: "fixed-yield-tokens",
      name: t`Fixed Yield Tokens`,
      quantity: numFYTsInWallet,
      totalFiatValue: totalFYTFiatValue,
      contentRenderer: () => <FYTPortfolio account={account} />,
    },
    {
      id: "yield-coupons",
      name: t`Yield Coupons`,
      quantity: 0,
      totalFiatValue: Money.fromDecimal(0.0, currency),
      contentRenderer: () => <YCPortfolio account={account} />,
    },
    {
      id: "liquidity-positions",
      name: t`Liquidity positions`,
      quantity: 0,
      totalFiatValue: Money.fromDecimal(0.0, currency),
      contentRenderer: () => <LiquidityPositionPortfolio account={account} />,
    },
  ];
}

function useFYTTab(account: string | null | undefined) {
  const numFYTsInWallet = useNumUniqueFYTsInWallet(account);
  const totalFiatValue = useTotalFYTFiatBalance(account);

  return { numFYTsInWallet, totalFiatValue };
}
