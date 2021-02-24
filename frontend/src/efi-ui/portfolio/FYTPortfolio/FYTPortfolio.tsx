import React, { FC } from "react";

import { Card } from "@blueprintjs/core";

import tw from "efi-tailwindcss-classnames";
import { FYTTable } from "efi-ui/portfolio/FYTTable/FYTTable";
import { NoFYTsInWalletNonIdealState } from "efi-ui/wallets/NoFYTsInWalletNonIdealState/NoFYTsInWalletNonIdealState";
import { NoWalletConnectedNonIdealState } from "efi-ui/wallets/NoWalletConnectedNonIdealState/NoWalletConnectedNonIdealState";
import { Tranche } from "elf-contracts/types";

interface FYTPortfolioProps {
  account: string | null | undefined;
  tranches: Tranche[];
}

export const FYTPortfolio: FC<FYTPortfolioProps> = ({ account, tranches }) => {
  const hasFYTs = tranches.length;

  let nonIdealStateContent = null;
  if (!account) {
    nonIdealStateContent = <NoWalletConnectedNonIdealState />;
  } else if (!hasFYTs) {
    nonIdealStateContent = <NoFYTsInWalletNonIdealState />;
  }

  return (
    <Card className={tw("flex-1", "p-8")}>
      {nonIdealStateContent || (
        <FYTTable account={account} tranches={tranches} />
      )}
    </Card>
  );
};
