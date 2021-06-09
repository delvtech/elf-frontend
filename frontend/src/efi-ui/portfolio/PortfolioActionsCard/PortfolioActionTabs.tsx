import { ReactElement } from "react";

import { Tab, Tabs } from "@blueprintjs/core";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { PortfolioActionTabId } from "efi-ui/portfolio/PortfolioActionsCard/PortfolioActionTabId";

interface PortfolioActionTabsProps {
  activeTabId: PortfolioActionTabId;
  onSetActiveTab: (
    newTabId: PortfolioActionTabId,
    prevTabId: PortfolioActionTabId
  ) => void;

  isRedeemDisabled?: boolean;
}

export function PortfolioActionTabs(
  props: PortfolioActionTabsProps
): ReactElement {
  const { activeTabId, onSetActiveTab, isRedeemDisabled } = props;
  return (
    <Tabs
      id="save-transactions-tab"
      vertical
      selectedTabId={activeTabId}
      className={tw("text-left")}
      onChange={onSetActiveTab}
    >
      <Tab id={PortfolioActionTabId.BUY}>{t`Buy`}</Tab>
      <Tab id={PortfolioActionTabId.SELL}>{t`Sell`}</Tab>
      <Tab
        id={PortfolioActionTabId.REDEEM}
        disabled={isRedeemDisabled}
      >{t`Redeem`}</Tab>
      <Tab id={PortfolioActionTabId.INFO}>{t`More Information`}</Tab>
    </Tabs>
  );
}
