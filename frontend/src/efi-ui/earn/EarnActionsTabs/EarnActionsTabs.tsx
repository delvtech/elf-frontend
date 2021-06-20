import { ReactElement } from "react";

import { Colors, Divider, Label, Tab, Tabs } from "@blueprintjs/core";
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
      <div
        className={tw("w-full", "my-1")}
        style={{ borderBottom: `1px solid ${Colors.GRAY1}` }}
      />
      <div className={tw("pt-2")}>{t`Add liquidity`}</div>
      <Tab
        id={EarnActionsTabId.STAKE_PRINCIPAL}
        disabled={isMature}
      >{t`Principal Tokens`}</Tab>
      <Tab
        id={EarnActionsTabId.STAKE_YIELD}
        disabled={isMature}
      >{t`Yield Tokens`}</Tab>
    </Tabs>
  );
}
