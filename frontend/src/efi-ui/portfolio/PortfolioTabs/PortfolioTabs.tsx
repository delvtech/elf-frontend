import React, { ReactElement } from "react";

import { Tab, Tabs } from "@blueprintjs/core";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { PortfolioAssetLabel } from "efi-ui/portfolio/PortfolioView/PortfolioAssetLabel";

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
      className={tw("flex", "justify-center", "items-center")}
      renderActiveTabPanelOnly
      onChange={onChangeTab}
      selectedTabId={activePortfolioTabId}
    >
      <Tab id={PortfolioTabId.PRINCIPAL_TOKENS} className={tw("lg:w-300")}>
        <PortfolioAssetLabel name={t`Principal Tokens`} />
      </Tab>
      <Tab id={PortfolioTabId.YIELD_TOKENS} className={tw("lg:w-300")}>
        <PortfolioAssetLabel name={t`Yield Tokens`} />
      </Tab>
      <Tab id={PortfolioTabId.LP_POSITIONS} className={tw("lg:w-300")}>
        <PortfolioAssetLabel name={t`LP Positions`} />
      </Tab>
    </Tabs>
  );
}
