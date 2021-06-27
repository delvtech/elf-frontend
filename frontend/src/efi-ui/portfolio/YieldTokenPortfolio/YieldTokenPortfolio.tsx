import React, { ReactElement } from "react";

import { Web3Provider } from "@ethersproject/providers";
import { AbstractConnector } from "@web3-react/abstract-connector";
import { InterestToken } from "elf-contracts/types/InterestToken";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { ERC20Shim } from "efi/contracts/ERC20Shim";
import { YieldTokenCard } from "efi-ui/portfolio/YieldTokenCard/YieldTokenCard";
import { useTokensWithBalance } from "efi-ui/token/hooks/useTokensWithBalance";
import { NoWalletConnectedNonIdealState } from "efi-ui/wallets/NoWalletConnectedNonIdealState/NoWalletConnectedNonIdealState";
import { NoYieldTokensInWalletNonIdealState } from "efi-ui/wallets/NoYieldTokensInWalletNonIdealState/NoYieldTokensInWalletNonIdealState";
import { interestTokenContracts } from "efi/interestToken/interestToken";

interface YieldTokenPortfolioProps {
  chainId: number | undefined;
  library: Web3Provider | undefined;
  connector: AbstractConnector | undefined;
  walletConnectionActive: boolean;
  account: string | null | undefined;
}

export function YieldTokenPortfolio({
  library,
  chainId,
  connector,
  walletConnectionActive,
  account,
}: YieldTokenPortfolioProps): ReactElement {
  const { yieldTokensWithBalance } = useYieldTokenTab(library, account);
  const hasInterestTokens = yieldTokensWithBalance?.length;

  let nonIdealStateContent = null;
  if (!account) {
    nonIdealStateContent = (
      <NoWalletConnectedNonIdealState
        title={t`Connect your wallet to view your portfolio`}
      />
    );
  }
  if (!hasInterestTokens) {
    nonIdealStateContent = <NoYieldTokensInWalletNonIdealState />;
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
        yieldTokensWithBalance.map((interestToken) => [
          <YieldTokenCard
            chainId={chainId}
            library={library}
            connector={connector}
            walletConnectionActive={walletConnectionActive}
            key={interestToken.address}
            account={account}
            yieldToken={interestToken}
          />,
        ])
      )}
    </div>
  );
}

function useYieldTokenTab(
  library: Web3Provider | undefined,
  account: string | null | undefined
) {
  const yieldTokensWithBalanceResults = useTokensWithBalance(
    account,
    interestTokenContracts as unknown as ERC20Shim[]
  );

  const yieldTokensWithBalance = yieldTokensWithBalanceResults.map(
    ({ token }) => token as unknown as InterestToken
  );

  return {
    yieldTokensWithBalance,
  };
}
