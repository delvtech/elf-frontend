import { ReactElement } from "react";

import { Intent, Tab, Tabs, Tag } from "@blueprintjs/core";
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
      <Tab disabled={isMature} id={EarnActionsTabId.MINT}>
        <Tag round minimal className={tw("mr-2")}>
          1
        </Tag>
        {t`Mint`}
      </Tab>
      <Tab
        disabled={true /* isMature */}
        id={EarnActionsTabId.PROVIDE_LIQUIDITY}
      >
        <Tag round minimal className={tw("mr-2")}>
          2
        </Tag>
        {t`Provide Liquidity`}
        <Tag intent={Intent.WARNING} minimal className={tw("ml-2")}>
          {t`Coming soon`}
        </Tag>
      </Tab>
    </Tabs>
  );
}
