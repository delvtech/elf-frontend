import React, { ReactElement, useCallback } from "react";

import { Button, NonIdealState } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { useNavigation } from "efi-ui/navigation/hooks/useTab";
import { Navigation } from "efi-ui/navigation/navigation";

export function NoPrincipalTokensInWalletNonIdealState(): ReactElement {
  const { changeTab } = useNavigation();
  const goToEarn = useCallback(() => changeTab(Navigation.EARN), [changeTab]);
  const goToDeposit = useCallback(() => changeTab(Navigation.DEPOSIT), [
    changeTab,
  ]);

  return (
    <NonIdealState
      icon={IconNames.BANK_ACCOUNT}
      className={tw("text-base")}
      description={t`This wallet does not contain any Principal Tokens.`}
      action={
        <div className={tw("flex")}>
          <Button
            outlined
            large
            onClick={goToDeposit}
            className={tw("mr-2")}
          >{t`Go to Deposit`}</Button>
          <Button outlined large onClick={goToEarn}>{t`Go to Earn`}</Button>
        </div>
      }
    />
  );
}
