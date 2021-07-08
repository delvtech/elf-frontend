import { Fragment, ReactElement } from "react";

import { Web3Provider } from "@ethersproject/providers";
import { ERC20 } from "elf-contracts/types/ERC20";
import { BigNumber } from "ethers";
import zip from "lodash.zip";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { ERC20Shim } from "efi/contracts/ERC20Shim";
import { useNewPrincipalTokensPendingTransaction } from "efi-ui/portfolio/hooks/useNewPrincipalTokensPendingTransaction";
import { PrincipalTokenCard } from "efi-ui/portfolio/PrincipalTokenCard/PrincipalTokenCard";
import { useTokensWithBalance } from "efi-ui/token/hooks/useTokensWithBalance";
import { NoPrincipalTokensInWalletNonIdealState } from "efi-ui/wallets/NoPrincipalTokensInWalletNonIdealState/NoPrincipalTokensInWalletNonIdealState";
import { NoWalletConnectedNonIdealState } from "efi-ui/wallets/NoWalletConnectedNonIdealState/NoWalletConnectedNonIdealState";
import { isDust } from "efi/coins/isDust";
import { trancheContracts } from "efi/tranche/tranches";
import { PrincipalTokenInfo } from "tokenlists/types";
import { getTokenInfo } from "efi/tokenlists";

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
  const principalTokens = usePrincipalTokenTab(account);

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

function usePrincipalTokenTab(
  account: string | null | undefined
): PrincipalTokenInfo[] {
  const principalTokensWithBalanceResults = useTokensWithBalance(
    account,
    trancheContracts as unknown as ERC20Shim[]
  );

  const principalTokenInfosWithBalance = principalTokensWithBalanceResults.map(
    ({ token }) => getTokenInfo<PrincipalTokenInfo>(token.address)
  );

  // filter out dust, because redeeming a PT can leave a small amount of dust in
  // the user's account
  const principalTokensWithoutDust = zip(
    principalTokensWithBalanceResults,
    principalTokenInfosWithBalance
  )
    .filter(
      (
        zipped
      ): zipped is [
        { token: ERC20; balanceOf: BigNumber },
        PrincipalTokenInfo
      ] => zipped.every((v) => !!v)
    )
    .filter(
      ([{ balanceOf }, principalTokenInfo]) =>
        !isDust(balanceOf, principalTokenInfo.decimals)
    )
    .map(([unusedTokenWithBalance, principalTokenInfo]) => principalTokenInfo);

  return principalTokensWithoutDust;
}
