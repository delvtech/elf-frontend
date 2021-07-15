import { Fragment, ReactElement } from "react";

import { Web3Provider } from "@ethersproject/providers";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { useNewPrincipalTokensPendingTransaction } from "efi-ui/portfolio/hooks/useNewPrincipalTokensPendingTransaction";
import { PrincipalTokenCard } from "efi-ui/portfolio/PrincipalTokenCard/PrincipalTokenCard";
import { NoPrincipalTokensInWalletNonIdealState } from "efi-ui/wallets/NoPrincipalTokensInWalletNonIdealState/NoPrincipalTokensInWalletNonIdealState";
import { NoWalletConnectedNonIdealState } from "efi-ui/wallets/NoWalletConnectedNonIdealState/NoWalletConnectedNonIdealState";
import { PrincipalTokenInfo } from "tokenlists/types";
import { usePrincipalTokensWithoutDust } from "efi-ui/tranche/usePrincipalTokensWithoutDust";

interface PrincipalTokenPortfolioProps {
  chainId: number | undefined;
  library: Web3Provider | undefined;
  account: string | null | undefined;
}

export function PrincipalTokenPortfolio({
  library,
  account,
  chainId,
}: PrincipalTokenPortfolioProps): ReactElement {
  const principalTokens = usePrincipalTokensWithoutDust(account);

  const pendingPrincipalTokenTransaction =
    useNewPrincipalTokensPendingTransaction();

  const hasFYTs =
    !!principalTokens?.length || !!pendingPrincipalTokenTransaction;

  return (
    <PrincipalTokenCards
      chainId={chainId}
      library={library}
      account={account}
      hasFYTs={hasFYTs}
      principalTokens={principalTokens}
    />
  );
}

interface PrincipalTokenCardsProps {
  account: string | null | undefined;
  chainId: number | undefined;
  library: Web3Provider | undefined;
  hasFYTs: boolean;
  principalTokens: PrincipalTokenInfo[];
}

function PrincipalTokenCards(props: PrincipalTokenCardsProps) {
  const { account, chainId, library, hasFYTs, principalTokens } = props;

  let nonIdealStateContent = null;
  if (!account) {
    nonIdealStateContent = (
      <NoWalletConnectedNonIdealState
        title={t`Connect your wallet to view your portfolio`}
      />
    );
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
        <Fragment>
          {principalTokens?.map((principalToken) => [
            <div key={principalToken.address}>
              <PrincipalTokenCard
                chainId={chainId}
                library={library}
                account={account}
                principalTokenInfo={principalToken}
              />
            </div>,
          ])}
        </Fragment>
      )}
    </div>
  );
}
