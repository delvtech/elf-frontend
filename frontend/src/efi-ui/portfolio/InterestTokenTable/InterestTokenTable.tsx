import React, { ReactElement } from "react";

import { Web3Provider } from "@ethersproject/providers";
import { InterestToken } from "elf-contracts/types/InterestToken";

import tw from "efi-tailwindcss-classnames";
import { YieldTokenCard } from "efi-ui/portfolio/YieldTokenCard/YieldTokenCard";

interface InterestTokenTableProps {
  library: Web3Provider | undefined;
  account: string | null | undefined;
  interestTokens: InterestToken[];
}

export function InterestTokenTable({
  library,
  account,
  interestTokens,
}: InterestTokenTableProps): ReactElement {
  return (
    <div
      data-testid="interesttoken-table"
      className={tw("flex", "flex-col", "w-full")}
    >
      {interestTokens.map((interestToken) => (
        <YieldTokenCard
          key={interestToken.address}
          library={library}
          account={account}
          interestToken={interestToken}
        />
      ))}
    </div>
  );
}
