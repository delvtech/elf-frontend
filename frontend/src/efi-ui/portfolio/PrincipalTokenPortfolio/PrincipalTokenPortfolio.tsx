import { ReactElement, Fragment, useMemo } from "react";

import { Provider, Web3Provider } from "@ethersproject/providers";
import { ERC20 } from "elf-contracts/types/ERC20";
import { Tranche } from "elf-contracts/types/Tranche";
import { BigNumber } from "ethers";
import zip from "lodash.zip";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { ERC20Shim } from "efi-ui/contracts/ERC20Shim";
import { useNewPrincipalTokensPendingTransaction } from "efi-ui/portfolio/hooks/useNewPrincipalTokensPendingTransaction";
import { PrincipalTokenCard } from "efi-ui/portfolio/PrincipalTokenCard/PrincipalTokenCard";
import { useTokenDecimalsMulti } from "efi-ui/token/hooks/useTokenDecimalsMulti";
import { useTokensWithBalance } from "efi-ui/token/hooks/useTokensWithBalance";
import { NoPrincipalTokensInWalletNonIdealState } from "efi-ui/wallets/NoPrincipalTokensInWalletNonIdealState/NoPrincipalTokensInWalletNonIdealState";
import { NoWalletConnectedNonIdealState } from "efi-ui/wallets/NoWalletConnectedNonIdealState/NoWalletConnectedNonIdealState";
import { isDust } from "efi/coins/isDust";
import { TrancheContracts } from "efi/tranche/tranches";
import { getQueryCombinedStatus } from "efi-ui/query/getQueryCombinedStatus";
import { PrincipalTokenInfos } from "efi/tokenlists";

interface PrincipalTokenPortfolioProps {
  chainId: number | undefined;
  library: Web3Provider | undefined;
  provider: Provider | undefined;
  account: string | null | undefined;
}

// TODO: use this wording from will
// const mintLabel = t`Stake or sell your principal token to gain liquidity again`;
// const swapLabel = t`Stake when the transaction is confirmed to boost your apy further`;
export function PrincipalTokenPortfolio({
  library,
  provider,
  account,
  chainId,
}: PrincipalTokenPortfolioProps): ReactElement {
  const principalTokens = usePrincipalTokenTab(library, account, provider);

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
  principalTokens: Tranche[] | undefined;
}

function PrincipalTokenCards(props: PrincipalTokenCardsProps) {
  const { account, chainId, library, hasFYTs, principalTokens } = props;

  // useWhyDidYouUpdate("PrincipalTokenCards", props);
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
                tranche={principalToken}
              />
            </div>,
          ])}
        </Fragment>
      )}
    </div>
  );
}

function usePrincipalTokenTab(
  library: Web3Provider | undefined,
  account: string | null | undefined,
  provider?: Provider
) {
  const principalTokensWithBalanceResults = useTokensWithBalance(
    account,
    TrancheContracts as unknown as ERC20Shim[],
    provider
  );
  const principalTokenDecimals = principalTokensWithBalanceResults?.map(
    ({ token }) =>
      PrincipalTokenInfos.find((info) => info.address === token.address)
        ?.decimals
  );

  const principalTokenDecimalResults = useTokenDecimalsMulti(TrancheContracts);
  const decimalResultsStatus = getQueryCombinedStatus(
    principalTokenDecimalResults
  );

  // filter out dust, because redeeming a PT can leave a small amount of dust in
  // the user's account

  const principalTokensWithoutDust = useMemo(() => {
    const tokens = zip(
      principalTokensWithBalanceResults,
      principalTokenDecimals
    )
      .filter((zipped): zipped is [
        { token: ERC20; balanceOf: BigNumber },
        number
      ] => zipped.every((v) => !!v))
      .filter(([{ balanceOf }, decimals]) => !isDust(balanceOf, decimals))
      .map(([{ token }]) => token as unknown as Tranche);
    return tokens;
  }, [principalTokenDecimals, principalTokensWithBalanceResults]);

  if (decimalResultsStatus === "loading") {
    return undefined;
  }

  // The total fiat balance
  // const totalFiatBalanceAllPrincipalTokens = useTotalFiatBalance(
  //   library,
  //   account,
  //   principalTokensWithoutDust
  // );

  return principalTokensWithoutDust;
  // totalFiatBalanceAllPrincipalTokens,
}
