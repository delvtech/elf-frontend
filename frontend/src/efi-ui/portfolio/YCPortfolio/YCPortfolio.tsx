import React, { FC } from "react";

import { Web3Provider } from "@ethersproject/providers";

import tw from "efi-tailwindcss-classnames";
import { YCCard } from "efi-ui/portfolio/YCTable/YCCard";
import { NoWalletConnectedNonIdealState } from "efi-ui/wallets/NoWalletConnectedNonIdealState/NoWalletConnectedNonIdealState";
import { NoYCsInWalletNonIdealState } from "efi-ui/wallets/NoYCsInWalletNonIdealState/NoYCsInWalletNonIdealState";
import { InterestToken } from "elf-contracts/types/InterestToken";

interface YCPortfolioProps {
  library: Web3Provider | undefined;
  account: string | null | undefined;
  interestTokens: InterestToken[];
}

export const YCPortfolio: FC<YCPortfolioProps> = ({
  library,
  account,
  interestTokens,
}) => {
  const hasYCs = interestTokens.length;

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
        interestTokens.map((yieldCoupon) => [
          <YCCard
            key={yieldCoupon.address}
            library={library}
            account={account}
            interestToken={yieldCoupon}
          />,
        ])
      )}
    </div>
  );
};
