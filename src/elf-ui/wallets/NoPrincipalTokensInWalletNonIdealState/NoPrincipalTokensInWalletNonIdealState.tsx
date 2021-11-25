import React, { ReactElement, useCallback } from "react";

import { Button, NonIdealState } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { t } from "ttag";

import tw from "elf-tailwindcss-classnames";
import { useNavigation } from "elf-ui/app/navigation/hooks/useTab";
import { Navigation } from "elf-ui/app/navigation/navigation";

export function NoPrincipalTokensInWalletNonIdealState(): ReactElement {
  const { changeTab } = useNavigation();
  const goToEarn = useCallback(() => changeTab(Navigation.MINT), [changeTab]);

  return (
    <NonIdealState
      icon={IconNames.BANK_ACCOUNT}
      className={tw("text-base")}
      description={t`This wallet does not contain any Principal Tokens.`}
      action={
        <div className={tw("flex")}>
          <Button outlined large onClick={goToEarn}>{t`Go to Earn`}</Button>
        </div>
      }
    />
  );
}
