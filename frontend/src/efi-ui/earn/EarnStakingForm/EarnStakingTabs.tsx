import { ReactElement } from "react";

import { Tab, Tabs } from "@blueprintjs/core";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";

export enum EarnStakingTabId {
  PRINCIPAL = "principal",
  YIELD = "yield",
}

export interface EarnStakingTabsProps {
  activeTabId: EarnStakingTabId;
  onSetActiveTab: (
    newTabId: EarnStakingTabId,
    prevTabId: EarnStakingTabId
  ) => void;
}

export function EarnStakingTabs(props: EarnStakingTabsProps): ReactElement {
  const { activeTabId, onSetActiveTab } = props;
  return (
    <Tabs
      id="earn-staking-tabs"
      vertical
      selectedTabId={activeTabId}
      className={tw("text-left")}
      onChange={onSetActiveTab}
    >
      <Tab id={EarnStakingTabId.PRINCIPAL}>{t`Principal Tokens`}</Tab>
      <Tab id={EarnStakingTabId.YIELD}>{t`Yield Tokens`}</Tab>
    </Tabs>
  );
}
