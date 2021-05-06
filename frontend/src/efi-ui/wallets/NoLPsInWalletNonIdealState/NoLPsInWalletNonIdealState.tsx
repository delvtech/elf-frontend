import React, { ReactElement, useCallback } from "react";

import { Button, NonIdealState } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { t } from "ttag";

import { useNavigation } from "efi-ui/navigation/hooks/useTab";
import { Navigation } from "efi-ui/navigation/navigation";

export function NoLPsInWalletNonIdealState(): ReactElement {
  const { changeTab } = useNavigation();
  const goToExchange = useCallback(() => changeTab(Navigation.YIELD_POOLS), [
    changeTab,
  ]);
  return (
    <NonIdealState
      icon={IconNames.BANK_ACCOUNT}
      description={t`This wallet does not contain any Liquidity Positions. Stake your portfolio Yield and Principal tokens.`}
    />
  );
}
