import React, { FC, useCallback } from "react";

import { Button, NonIdealState } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { t } from "ttag";

import { useNavigation } from "efi-ui/navigation/hooks/useTab";
import { Navigation } from "efi-ui/navigation/navigation";

interface NoFYTsInWalletNonIdealStateProps {}

export const NoFYTsInWalletNonIdealState: FC<NoFYTsInWalletNonIdealStateProps> = () => {
  const { changeTab } = useNavigation();
  const goToInvest = useCallback(() => changeTab(Navigation.INVEST), [
    changeTab,
  ]);
  return (
    <NonIdealState
      icon={IconNames.BANK_ACCOUNT}
      description={t`This wallet does not contain any Fixed Yield Tokens.`}
      action={
        <Button outlined large onClick={goToInvest}>{t`Go to Invest`}</Button>
      }
    />
  );
};
