import React, { FC } from "react";

import { Card } from "@blueprintjs/core";

import tw from "efi-tailwindcss-classnames";
import { NoWalletConnectedNonIdealState } from "efi-ui/wallets/NoWalletConnectedNonIdealState/NoWalletConnectedNonIdealState";
import { NoYCsInWalletNonIdealState } from "efi-ui/wallets/NoYCsInWalletNonIdealState/NoYCsInWalletNonIdealState";
import { YCTable } from "efi-ui/portfolio/YCTable/YCTable";
import { YC } from "elf-contracts/types";
import { YCCard } from "efi-ui/portfolio/YCTable/YCCard";

interface YCPortfolioProps {
  account: string | null | undefined;
  yieldCoupons: YC[];
}

export const YCPortfolio: FC<YCPortfolioProps> = ({
  account,
  yieldCoupons,
}) => {
  const hasYCs = yieldCoupons.length;

  let nonIdealStateContent = null;
  if (!account) {
    nonIdealStateContent = <NoWalletConnectedNonIdealState />;
  }
  if (!hasYCs) {
    nonIdealStateContent = <NoYCsInWalletNonIdealState />;
  }

  return (
    <div className={tw("flex", "space-x-8", "flex-1", "pl-2")}>
      {nonIdealStateContent ? (
        <div className={tw("flex", "flex-1", "justify-center", "items-center")}>
          {nonIdealStateContent}
        </div>
      ) : (
        yieldCoupons.map((yieldCoupon) => [
          <YCCard
            key={yieldCoupon.address}
            account={account}
            yieldCoupon={yieldCoupon}
          />,
        ])
      )}
    </div>
  );
};
