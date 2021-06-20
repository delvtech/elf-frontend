import { ReactElement } from "react";

import { Tab, Tabs } from "@blueprintjs/core";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { MintActionsTabId } from "efi-ui/mint/MintCard/MintActionsCard";
import { getIsMature2 } from "efi/tranche/getIsMature";

interface MintActionTabsProps {
  activeTabId: MintActionsTabId;
  onSetActiveTab: (
    newTabId: MintActionsTabId,
    prevTabId: MintActionsTabId
  ) => void;

  unlockTimestamp: number;
}

export function MintActionsTabs(props: MintActionTabsProps): ReactElement {
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
      <Tab disabled={isMature} id={MintActionsTabId.MINT}>{t`Mint`}</Tab>
      <Tab disabled={isMature} id={MintActionsTabId.SELL}>{t`Sell`}</Tab>
      <Tab
        id={MintActionsTabId.STAKE}
        disabled={isMature}
      >{t`Add liquidity`}</Tab>
    </Tabs>
  );
}
