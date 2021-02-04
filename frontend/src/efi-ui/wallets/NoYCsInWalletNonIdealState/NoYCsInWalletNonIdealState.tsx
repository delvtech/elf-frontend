import React, { FC } from "react";
import { Button, NonIdealState } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { t } from "ttag";

interface NoYCsInWalletNonIdealStateProps {
  onGoToMint: () => void;
}

export const NoYCsInWalletNonIdealState: FC<NoYCsInWalletNonIdealStateProps> = ({
  onGoToMint,
}) => {
  return (
    <NonIdealState
      icon={IconNames.BANK_ACCOUNT}
      description={t`This wallet does not contain any Yield Coupons.`}
      action={
        <Button outlined large onClick={onGoToMint}>{t`Go to Mint`}</Button>
      }
    />
  );
};
