import React, { FC } from "react";

import { Tranche } from "elf-contracts/types/Tranche";

import tw from "efi-tailwindcss-classnames";
import { NoFYTsInWalletNonIdealState } from "efi-ui/wallets/NoFYTsInWalletNonIdealState/NoFYTsInWalletNonIdealState";
import { NoWalletConnectedNonIdealState } from "efi-ui/wallets/NoWalletConnectedNonIdealState/NoWalletConnectedNonIdealState";
import { Web3Provider } from "@ethersproject/providers";
import { PrincipalTokenCard } from "efi-ui/portfolio/PrincipalTokenCard/PrincipalTokenCard";

interface PrincipalTokenPortfolioProps {
  library: Web3Provider | undefined;
  account: string | null | undefined;
  tranches: Tranche[];
}

export const PrincipalTokenPortfolio: FC<PrincipalTokenPortfolioProps> = ({
  library,
  account,
  tranches,
}) => {
  const hasFYTs = tranches.length;

  let nonIdealStateContent = null;
  if (!account) {
    nonIdealStateContent = <NoWalletConnectedNonIdealState />;
  } else if (!hasFYTs) {
    nonIdealStateContent = <NoFYTsInWalletNonIdealState />;
  }

  return (
    <div
      className={tw(
        "flex",
        "space-x-8",
        "flex-1",
        "pl-2",
        "justify-center",
        "items-center"
      )}
    >
      {nonIdealStateContent ? (
        <div className={tw("flex", "flex-1", "justify-center", "items-center")}>
          {nonIdealStateContent}
        </div>
      ) : (
        tranches.map((tranche) => [
          <PrincipalTokenCard
            library={library}
            key={tranche.address}
            account={account}
            tranche={tranche}
          />,
        ])
      )}
    </div>
  );
};
