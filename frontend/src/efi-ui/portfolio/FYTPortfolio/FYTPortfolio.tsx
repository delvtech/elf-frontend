import React, { FC } from "react";

import { Card } from "@blueprintjs/core";

import tw from "efi-tailwindcss-classnames";
import { FYTTable } from "efi-ui/portfolio/FYTTable/FYTTable";
import { NoFYTsInWalletNonIdealState } from "efi-ui/wallets/NoFYTsInWalletNonIdealState/NoFYTsInWalletNonIdealState";
import { NoWalletConnectedNonIdealState } from "efi-ui/wallets/NoWalletConnectedNonIdealState/NoWalletConnectedNonIdealState";

interface FYTPortfolioProps {
  account: string | null | undefined;
}

export const FYTPortfolio: FC<FYTPortfolioProps> = ({ account }) => {
  // TODO: check user's wallet for FYTs
  const hasFYTs = true;

  let nonIdealStateContent = null;
  if (!account) {
    nonIdealStateContent = <NoWalletConnectedNonIdealState />;
  }
  if (!hasFYTs) {
    nonIdealStateContent = <NoFYTsInWalletNonIdealState />;
  }

  return (
    <Card className={tw("flex-1", "p-8")}>
      {nonIdealStateContent || <FYTTable account={account} />}
    </Card>
  );
};
