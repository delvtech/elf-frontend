import React, { FC } from "react";

import { Tranche } from "elf-contracts/types/Tranche";

import tw from "efi-tailwindcss-classnames";
import { PrincipalTokenCard } from "efi-ui/portfolio/PrincipalTokenCard/PrincipalTokenCard";
import { Web3Provider } from "@ethersproject/providers";

interface FYTTableProps {
  library: Web3Provider | undefined;
  account: string | null | undefined;
  tranches: Tranche[];
}

export const FYTTable: FC<FYTTableProps> = ({ library, account, tranches }) => {
  return (
    <div data-testid="fyt-table" className={tw("flex", "flex-col", "w-full")}>
      {tranches.map((tranche) => (
        <PrincipalTokenCard
          key={tranche.address}
          library={library}
          account={account}
          tranche={tranche}
        />
      ))}
    </div>
  );
};
