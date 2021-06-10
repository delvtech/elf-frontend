import { ReactElement } from "react";

import { Tab, Tabs } from "@blueprintjs/core";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { PrincipalTokenActionTabId } from "efi-ui/portfolio/PrincipalTokenActionTabs/tabs";

interface PortfolioActionTabsProps {
  activeTabId: PrincipalTokenActionTabId;
  onSetActiveTab: (
    newTabId: PrincipalTokenActionTabId,
    prevTabId: PrincipalTokenActionTabId
  ) => void;

  isRedeemDisabled?: boolean;
}

export function PrincipalTokenActionTabs(
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
      <Tab id={PrincipalTokenActionTabId.BUY}>{t`Buy`}</Tab>
      <Tab id={PrincipalTokenActionTabId.SELL}>{t`Sell`}</Tab>
      <Tab
        id={PrincipalTokenActionTabId.REDEEM}
        disabled={isRedeemDisabled}
      >{t`Redeem`}</Tab>
      <Tab id={PrincipalTokenActionTabId.INFO}>{t`More Information`}</Tab>
    </Tabs>
  );
}
