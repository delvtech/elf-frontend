import React, { ReactElement } from "react";

import { Tab, Tabs } from "@blueprintjs/core";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import styles from "./PortfolioTabs.module.css";
import classNames from "classnames";

export enum PortfolioTabId {
  PRINCIPAL_TOKENS = "principalTokens",
  YIELD_TOKENS = "yieldTokens",
  LP_POSITIONS = "lpPositions",
}

interface PortfolioTabsProps {
  onChangeTab: (tabId: PortfolioTabId) => void;
  activePortfolioTabId: string;
}
export function PortfolioTabs({
  onChangeTab,
  activePortfolioTabId,
}: PortfolioTabsProps): ReactElement {
  return (
    <Tabs
      id="portfolio-tabs"
      large
      className={classNames(tw("w-500"), styles.portfolioTabs)}
      renderActiveTabPanelOnly
      onChange={onChangeTab}
      selectedTabId={activePortfolioTabId}
    >
      <Tab id={PortfolioTabId.PRINCIPAL_TOKENS}>
        <div className={tw("text-lg")}>{t`Principal Tokens`}</div>
      </Tab>
      <Tab id={PortfolioTabId.YIELD_TOKENS}>
        <div className={tw("text-lg")}>{t`Yield Tokens`}</div>
      </Tab>
      <Tab id={PortfolioTabId.LP_POSITIONS}>
        <div className={tw("text-lg")}>{t`LP Positions`}</div>
      </Tab>
    </Tabs>
  );
}
