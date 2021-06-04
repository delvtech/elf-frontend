import { ReactElement, useCallback } from "react";

import { Button } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { assertNever } from "efi/base/assertNever";

import { SaveNavigation } from "../SaveNavigation/SaveNavigation";

interface SaveTabProps {
  activeTab: SaveNavigation;
  onActiveTabChange: (newTab: SaveNavigation) => void;
}

export function SaveTab(props: SaveTabProps): ReactElement {
  const { activeTab, onActiveTabChange } = props;

  const onActiveTabClick = useCallback(() => {
    switch (activeTab) {
      case SaveNavigation.SAVE:
        onActiveTabChange(SaveNavigation.BALANCES);
        return;
      case SaveNavigation.BALANCES:
        onActiveTabChange(SaveNavigation.SAVE);
        return;
      default:
        assertNever(activeTab);
    }
  }, [activeTab, onActiveTabChange]);

  const activeTabLabel = getActiveTabLabel(activeTab);
  const activeTabIcon = getActiveTabIconName(activeTab);

  return (
    <div className={tw("text-right")}>
      <Button minimal large onClick={onActiveTabClick} icon={activeTabIcon}>
        {activeTabLabel}
      </Button>
    </div>
  );
}

function getActiveTabLabel(activeTab: SaveNavigation) {
  switch (activeTab) {
    case SaveNavigation.SAVE: {
      return t`View balances`;
    }
    case SaveNavigation.BALANCES:
      return t`Back to Save`;
    default:
      assertNever(activeTab);
  }
}

function getActiveTabIconName(activeTab: SaveNavigation) {
  switch (activeTab) {
    case SaveNavigation.SAVE:
      return IconNames.TH_LIST;
    case SaveNavigation.BALANCES:
      return IconNames.ARROW_LEFT;
    default:
      assertNever(activeTab);
  }
}
