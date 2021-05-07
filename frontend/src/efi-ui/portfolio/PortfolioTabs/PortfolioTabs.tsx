import React, { ReactElement, ReactNode } from "react";

import { Tab, Tabs } from "@blueprintjs/core";
import { Money } from "ts-money";

import tw from "efi-tailwindcss-classnames";
import { PortfolioAssetLabel } from "efi-ui/portfolio/PortfolioView/PortfolioAssetLabel";

export interface PortfolioTab {
  id: string;
  name: string;
  quantity: number;

  totalFiatValue: Money;
  contentRenderer: (tab: PortfolioTab) => ReactNode;
}

interface PortfolioTabsProps {
  onChangeTab: (tabId: string) => void;
  activePortfolioTabId: string;
  portfolioTabs: PortfolioTab[];
}
export function PortfolioTabs({
  onChangeTab,
  activePortfolioTabId,
  portfolioTabs,
}: PortfolioTabsProps): ReactElement {
  return (
    <Tabs
      id="portfolio-tabs"
      large
      className={tw("flex", "justify-center")}
      renderActiveTabPanelOnly
      onChange={onChangeTab}
      selectedTabId={activePortfolioTabId}
    >
      {portfolioTabs.map(({ id, name, quantity, totalFiatValue }) => (
        <Tab key={id} id={id} className={tw("lg:w-300")}>
          <PortfolioAssetLabel
            id={id}
            name={name}
            quantity={quantity}
            totalFiatValue={totalFiatValue}
          />
        </Tab>
      ))}
    </Tabs>
  );
}
