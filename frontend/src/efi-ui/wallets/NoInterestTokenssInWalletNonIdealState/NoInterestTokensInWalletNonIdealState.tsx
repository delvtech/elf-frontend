import React, { FC, useCallback } from "react";

import { Button, NonIdealState } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { t } from "ttag";

import { useNavigation } from "efi-ui/navigation/hooks/useTab";
import { Navigation } from "efi-ui/navigation/navigation";

interface NoITsInWalletNonIdealStateProps {}

export const NoInterestTokenssInWalletNonIdealState: FC<NoITsInWalletNonIdealStateProps> = () => {
  const { changeTab } = useNavigation();
  const goToMint = useCallback(() => changeTab(Navigation.MINT), [changeTab]);
  return (
    <NonIdealState
      icon={IconNames.BANK_ACCOUNT}
      description={t`This wallet does not contain any Interest Tokens.`}
      action={
        <Button outlined large onClick={goToMint}>{t`Go to Mint`}</Button>
      }
    />
  );
};
