import React, { FC } from "react";

import { Tranche } from "elf-contracts/types/Tranche";

import tw from "efi-tailwindcss-classnames";
import { NoPrincipalTokensInWalletNonIdealState } from "efi-ui/wallets/NoPrincipalTokensInWalletNonIdealState/NoPrincipalTokensInWalletNonIdealState";
import { NoWalletConnectedNonIdealState } from "efi-ui/wallets/NoWalletConnectedNonIdealState/NoWalletConnectedNonIdealState";
import { Web3Provider } from "@ethersproject/providers";
import { PrincipalTokenCard } from "efi-ui/portfolio/PrincipalTokenCard/PrincipalTokenCard";
import { AbstractConnector } from "@web3-react/abstract-connector";

interface PrincipalTokenPortfolioProps {
  chainId: number | undefined;
  library: Web3Provider | undefined;
  connector: AbstractConnector | undefined;
  walletConnectionActive: boolean;
  account: string | null | undefined;
  tranches: Tranche[];
}

export const PrincipalTokenPortfolio: FC<PrincipalTokenPortfolioProps> = ({
  library,
  account,
  connector,
  walletConnectionActive,
  chainId,
  tranches,
}) => {
  const hasFYTs = tranches.length;

  let nonIdealStateContent = null;
  if (!account) {
    nonIdealStateContent = <NoWalletConnectedNonIdealState />;
  } else if (!hasFYTs) {
    nonIdealStateContent = <NoPrincipalTokensInWalletNonIdealState />;
  }

  return (
    <div
      className={tw(
        "flex",
        "flex-1",
        "flex-wrap",
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
            key={tranche.address}
            chainId={chainId}
            library={library}
            connector={connector}
            walletConnectionActive={walletConnectionActive}
            account={account}
            tranche={tranche}
          />,
        ])
      )}
    </div>
  );
};
