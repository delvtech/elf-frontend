import React from "react";

import { Provider, Web3Provider } from "@ethersproject/providers";
import { AbstractConnector } from "@web3-react/abstract-connector";
import { Money } from "ts-money";
import { t } from "ttag";

import { useYieldTokensWithBalance } from "efi-ui/interestToken/useYieldTokensWithBalance/useYieldTokensWithBalance";
import { useFiatBalanceAllPrincipalTokens } from "efi-ui/portfolio/hooks/useFiatBalanceAllPrincipalTokens";
import { useFiatBalanceAllYieldTokens } from "efi-ui/portfolio/hooks/useFiatBalanceAllYieldTokens";
import { useTranchesWithBalance } from "efi-ui/portfolio/hooks/useTranchesWithBalance";
import { LiquidityPositionPortfolio } from "efi-ui/portfolio/LiquidityPositionPortfolio/LiquidityPositionPortfolio";
import { PortfolioTab } from "efi-ui/portfolio/PortfolioTabs/PortfolioTabs";
import { PrincipalTokenPortfolio } from "efi-ui/portfolio/PrincipalTokenPortfolio/PrincipalTokenPortfolio";
import { YieldTokenPortfolio } from "efi-ui/portfolio/YieldTokenPortfolio/YieldTokenPortfolio";
import { useCurrencyPref } from "efi-ui/prefs/useCurrency/useCurencyPref";

export function usePortfolioTabs(
  chainId: number | undefined,
  library: Web3Provider | undefined,
  connector: AbstractConnector | undefined,
  walletConnectionActive: boolean,
  account: string | null | undefined,
  provider?: Provider
): PortfolioTab[] {
  const { currency } = useCurrencyPref();
  const {
    tranchesWithBalance,
    totalFiatBalanceAllTranches,
  } = usePrincipalTokenTab(library, account, provider);

  const {
    yieldTokensWithBalance,
    totalFiatBalanceAllYieldTokens,
  } = useYieldTokenTab(library, account, provider);

  return [
    {
      id: "principal-tokens",
      name: t`Principal Tokens`,
      quantity: tranchesWithBalance.length,
      totalFiatValue: totalFiatBalanceAllTranches,
      contentRenderer: () => (
        <PrincipalTokenPortfolio
          chainId={chainId}
          library={library}
          connector={connector}
          walletConnectionActive={walletConnectionActive}
          account={account}
          tranches={tranchesWithBalance}
        />
      ),
    },
    {
      id: "yield-tokens",
      name: t`Yield Tokens`,
      quantity: yieldTokensWithBalance.length,
      totalFiatValue: totalFiatBalanceAllYieldTokens,
      contentRenderer: () => (
        <YieldTokenPortfolio
          library={library}
          account={account}
          yieldTokens={yieldTokensWithBalance}
        />
      ),
    },
    {
      id: "liquidity-positions",
      name: t`Liquidity positions`,
      quantity: 0,
      totalFiatValue: Money.fromDecimal(0.0, currency),
      contentRenderer: () => <LiquidityPositionPortfolio account={account} />,
    },
  ];
}

function usePrincipalTokenTab(
  library: Web3Provider | undefined,
  account: string | null | undefined,
  provider?: Provider
) {
  const tranchesWithBalance = useTranchesWithBalance(account, provider);
  const totalFiatBalanceAllTranches = useFiatBalanceAllPrincipalTokens(
    library,
    account
  );

  return { tranchesWithBalance, totalFiatBalanceAllTranches };
}

function useYieldTokenTab(
  library: Web3Provider | undefined,
  account: string | null | undefined,
  provider?: Provider
) {
  const { currency } = useCurrencyPref();
  const yieldTokensWithBalance = useYieldTokensWithBalance(account, provider);
  const totalFiatBalanceAllYieldTokens = useFiatBalanceAllYieldTokens(
    library,
    account,
    yieldTokensWithBalance,
    currency
  );

  return {
    yieldTokensWithBalance,
    totalFiatBalanceAllYieldTokens,
  };
}
