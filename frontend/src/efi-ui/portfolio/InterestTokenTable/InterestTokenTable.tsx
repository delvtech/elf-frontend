import React, { FC } from "react";

import tw from "efi-tailwindcss-classnames";
import { YieldTokenCard } from "efi-ui/portfolio/YieldTokenCard/YieldTokenCard";
import { Web3Provider } from "@ethersproject/providers";
import { InterestToken } from "elf-contracts/types/InterestToken";

interface InterestTokenTableProps {
  library: Web3Provider | undefined;
  account: string | null | undefined;
  interestTokens: InterestToken[];
}

// const tableHeaders = [
//   t`Asset`,
//   t`Quantity`,
//   t`Current exit value`,
//   t`Current acc. value`,
//   t`Yield rate (InterestToken)`,
//   t`Yield rate (Underlying)`,
//   t`Maturation date`,
//   t`Quick actions`,
// ];

export const InterestTokenTable: FC<InterestTokenTableProps> = ({
  library,
  account,
  interestTokens,
}) => {
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
};
