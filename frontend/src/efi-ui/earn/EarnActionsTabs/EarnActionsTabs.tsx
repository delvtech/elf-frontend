import { ReactElement } from "react";

import { Tab, Tabs } from "@blueprintjs/core";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { EarnActionsTabId } from "efi-ui/earn/EarnActionsTabs/EarnActionsTabId";
import { getIsMature2 } from "efi/tranche/getIsMature";

interface EarnActionsTabsProps {
  activeTabId: EarnActionsTabId;
  onSetActiveTab: (
    newTabId: EarnActionsTabId,
    prevTabId: EarnActionsTabId
  ) => void;

  unlockTimestamp: number;
}

export function EarnActionsTabs(props: EarnActionsTabsProps): ReactElement {
  const { activeTabId, onSetActiveTab, unlockTimestamp } = props;
  const isMature = getIsMature2(unlockTimestamp);
  return (
    <Tabs
      id="save-transactions-tab"
      vertical
      selectedTabId={activeTabId}
      className={tw("text-left")}
      onChange={onSetActiveTab}
    >
      <Tab disabled={isMature} id={EarnActionsTabId.MINT}>{t`Mint`}</Tab>
      <Tab disabled={isMature} id={EarnActionsTabId.SELL}>{t`Sell`}</Tab>
      <Tab
        id={EarnActionsTabId.STAKE}
        disabled={isMature}
      >{t`Add liquidity`}</Tab>
    </Tabs>
  );
}
