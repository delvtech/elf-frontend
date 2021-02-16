import React, { FC, ReactNode } from "react";

import { Tab, Tabs } from "@blueprintjs/core";
import classNames from "classnames";
import { Money } from "ts-money";

import tw from "efi-tailwindcss-classnames";
import { PortfolioAssetLabel } from "efi-ui/portfolio/PortfolioView/PortfolioAssetLabel";
import styles from "efi-ui/portfolio/PortfolioView/styles.module.css";

export interface PortfolioTab {
  id: string;
  name: string;
  quantity: number;

  totalFiatValue: Money | undefined;
  contentRenderer: (tab: PortfolioTab) => ReactNode;
}

interface PortfolioTabsProps {
  onChangeTab: (tabId: string) => void;
  activePortfolioTabId: string;
  portfolioTabs: PortfolioTab[];
}
export const PortfolioTabs: FC<PortfolioTabsProps> = ({
  onChangeTab,
  activePortfolioTabId,
  portfolioTabs,
}) => {
  return (
    <Tabs
      id="portfolio-tabs"
      vertical
      large
      className={classNames(tw("w-full"), styles.assetTabs)}
      onChange={onChangeTab}
      selectedTabId={activePortfolioTabId}
    >
      {portfolioTabs.map(({ id, name, quantity, totalFiatValue }) => (
        <Tab key={id} id={id} className={tw("w-full")}>
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
};
