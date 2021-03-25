import React, { FC } from "react";

import { Web3Provider } from "@ethersproject/providers";

import tw from "efi-tailwindcss-classnames";
import { InterestTokenCard } from "efi-ui/portfolio/InterestTokenTable/InterestTokenCard";
import { NoWalletConnectedNonIdealState } from "efi-ui/wallets/NoWalletConnectedNonIdealState/NoWalletConnectedNonIdealState";
import { NoInterestTokensInWalletNonIdealState } from "efi-ui/wallets/NoInterestTokenssInWalletNonIdealState/NoInterestTokensInWalletNonIdealState";
import { InterestToken } from "elf-contracts/types/InterestToken";

interface InterestTokenPortfolioProps {
  library: Web3Provider | undefined;
  account: string | null | undefined;
  interestTokens: InterestToken[];
}

export const InterestTokenPortfolio: FC<InterestTokenPortfolioProps> = ({
  library,
  account,
  interestTokens,
}) => {
  const hasInterestTokens = interestTokens.length;

  let nonIdealStateContent = null;
  if (!account) {
    nonIdealStateContent = <NoWalletConnectedNonIdealState />;
  }
  if (!hasInterestTokens) {
    nonIdealStateContent = <NoInterestTokensInWalletNonIdealState />;
  }

  return (
    <div className={tw("flex", "space-x-8", "flex-1", "pl-2")}>
      {nonIdealStateContent ? (
        <div className={tw("flex", "flex-1", "justify-center", "items-center")}>
          {nonIdealStateContent}
        </div>
      ) : (
        interestTokens.map((interestToken) => [
          <InterestTokenCard
            key={interestToken.address}
            library={library}
            account={account}
            interestToken={interestToken}
          />,
        ])
      )}
    </div>
  );
};
