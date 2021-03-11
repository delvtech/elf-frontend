import React, { FC } from "react";

import { YC } from "elf-contracts/types/YC";

import tw from "efi-tailwindcss-classnames";
import { YCCard } from "efi-ui/portfolio/YCTable/YCCard";
import { Web3Provider } from "@ethersproject/providers";

interface YCTableProps {
  library: Web3Provider | undefined;
  account: string | null | undefined;
  yieldCoupons: YC[];
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
  yieldCoupons,
}) => {
  return (
    <div data-testid="yc-table" className={tw("flex", "flex-col", "w-full")}>
      {yieldCoupons.map((yieldCoupon) => (
        <YCCard
          key={yieldCoupon.address}
          library={library}
          account={account}
          yieldCoupon={yieldCoupon}
        />
      ))}
    </div>
  );
};
