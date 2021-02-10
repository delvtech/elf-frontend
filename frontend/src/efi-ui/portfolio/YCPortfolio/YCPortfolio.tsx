import React, { FC } from "react";

import { Card } from "@blueprintjs/core";

import tw from "efi-tailwindcss-classnames";
import { NoWalletConnectedNonIdealState } from "efi-ui/wallets/NoWalletConnectedNonIdealState/NoWalletConnectedNonIdealState";
import { NoYCsInWalletNonIdealState } from "efi-ui/wallets/NoYCsInWalletNonIdealState/NoYCsInWalletNonIdealState";
import { YCTable } from "efi-ui/portfolio/YCTable/YCTable";

interface YCPortfolioProps {
  account: string | null | undefined;
}

export const YCPortfolio: FC<YCPortfolioProps> = ({ account }) => {
  // TODO: check user's wallet for YCs
  const hasYCs = true;

  let nonIdealStateContent = null;
  if (!account) {
    nonIdealStateContent = <NoWalletConnectedNonIdealState />;
  }
  if (!hasYCs) {
    nonIdealStateContent = <NoYCsInWalletNonIdealState />;
  }

  return (
    <Card className={tw("flex-1", "p-8")}>
      {nonIdealStateContent || <YCTable account={account} />}
    </Card>
  );
};
