import React, { FC } from "react";
import { Button, NonIdealState } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { t } from "ttag";

interface NoFYTsInWalletNonIdealStateProps {
  onGoToMint: () => void;
}

export const NoFYTsInWalletNonIdealState: FC<NoFYTsInWalletNonIdealStateProps> = ({
  onGoToMint,
}) => {
  return (
    <NonIdealState
      icon={IconNames.BANK_ACCOUNT}
      description={t`This wallet does not contain any Fixed Yield Tokens.`}
      action={
        <Button outlined large onClick={onGoToMint}>{t`Go to Mint`}</Button>
      }
    />
  );
};
