import React, { FC } from "react";

import tw from "efi-tailwindcss-classnames";
import { NoFYTsInWalletNonIdealState } from "efi-ui/wallets/NoFYTsInWalletNonIdealState/NoFYTsInWalletNonIdealState";
import { NoWalletConnectedNonIdealState } from "efi-ui/wallets/NoWalletConnectedNonIdealState/NoWalletConnectedNonIdealState";
import { Tranche } from "elf-contracts/types";
import { FYTCard } from "efi-ui/portfolio/FYTTable/FYTCard";

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
    <div className={tw("flex", "space-x-8", "flex-1", "pl-2")}>
      {nonIdealStateContent ? (
        <div className={tw("flex", "flex-1", "justify-center", "items-center")}>
          {nonIdealStateContent}
        </div>
      ) : (
        tranches.map((tranche) => [
          <FYTCard key={tranche.address} account={account} tranche={tranche} />,
        ])
      )}
    </div>
  );
};
