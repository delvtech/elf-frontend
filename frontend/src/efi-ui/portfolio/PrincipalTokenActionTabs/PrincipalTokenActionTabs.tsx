import { ReactElement } from "react";

import { Tab, Tabs } from "@blueprintjs/core";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { PrincipalTokenActionTabId } from "efi-ui/portfolio/PrincipalTokenActionTabs/tabs";
import { PrincipalTokenInfo } from "tokenlists/types";
import { getIsMature } from "efi/tranche/getIsMature";

interface PortfolioActionTabsProps {
  activeTabId: PrincipalTokenActionTabId;
  onSetActiveTab: (
    newTabId: PrincipalTokenActionTabId,
    prevTabId: PrincipalTokenActionTabId
  ) => void;

  principalToken: PrincipalTokenInfo;
}

export function PrincipalTokenActionTabs(
  props: PortfolioActionTabsProps
): ReactElement {
  const {
    activeTabId,
    onSetActiveTab,
    principalToken: {
      extensions: { unlockTimestamp },
    },
  } = props;
  const isMature = getIsMature(unlockTimestamp);
  return (
    <Tabs
      id="save-transactions-tab"
      vertical
      selectedTabId={activeTabId}
      className={tw("text-left")}
      onChange={onSetActiveTab}
    >
      <Tab disabled={isMature} id={PrincipalTokenActionTabId.BUY}>{t`Buy`}</Tab>
      <Tab
        disabled={isMature}
        id={PrincipalTokenActionTabId.SELL}
      >{t`Sell`}</Tab>
      <Tab
        id={PrincipalTokenActionTabId.REDEEM}
        disabled={!isMature}
      >{t`Redeem`}</Tab>
      <Tab id={PrincipalTokenActionTabId.INFO}>{t`More Information`}</Tab>
    </Tabs>
  );
}
