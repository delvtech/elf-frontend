import React, { FC } from "react";

import tw from "efi-tailwindcss-classnames";
import { InterestTokenCard } from "efi-ui/portfolio/InterestTokenTable/InterestTokenCard";
import { Web3Provider } from "@ethersproject/providers";
import { InterestToken } from "elf-contracts/types/InterestToken";

interface YCTableProps {
  library: Web3Provider | undefined;
  account: string | null | undefined;
  interestTokens: InterestToken[];
}

// const tableHeaders = [
//   t`Asset`,
//   t`Quantity`,
//   t`Current exit value`,
//   t`Current acc. value`,
//   t`Yield rate (YC)`,
//   t`Yield rate (Underlying)`,
//   t`Maturation date`,
//   t`Quick actions`,
// ];

export const YCTable: FC<YCTableProps> = ({
  library,
  account,
  interestTokens,
}) => {
  return (
    <div data-testid="yc-table" className={tw("flex", "flex-col", "w-full")}>
      {interestTokens.map((yieldCoupon) => (
        <InterestTokenCard
          key={yieldCoupon.address}
          library={library}
          account={account}
          interestToken={yieldCoupon}
        />
      ))}
    </div>
  );
};
