import React, { FC } from "react";

import { YC } from "elf-contracts/types";

import tw from "efi-tailwindcss-classnames";
import { YCCard } from "efi-ui/portfolio/YCTable/YCCard";

interface YCTableProps {
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

export const YCTable: FC<YCTableProps> = ({ account, yieldCoupons }) => {
  return (
    <div data-testid="yc-table" className={tw("flex", "flex-col", "w-full")}>
      {yieldCoupons.map((yieldCoupon) => (
        <YCCard
          key={yieldCoupon.address}
          account={account}
          yieldCoupon={yieldCoupon}
        />
      ))}
    </div>
  );
};
