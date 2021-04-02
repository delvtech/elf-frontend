import React from "react";
import { Provider, Web3Provider } from "@ethersproject/providers";
import { Money } from "ts-money";
import { t } from "ttag";

import { useInterestTokensWithBalance } from "efi-ui/interestToken/useInterestTokensWithBalance/useInterestTokensWithBalance";
import { useFiatBalanceAllTranches } from "efi-ui/portfolio/hooks/useTotalPrincipalTokenFiatBalance";
import { useTranchesWithBalance } from "efi-ui/portfolio/hooks/useTranchesWithBalance";
import { InterestTokenPortfolio } from "efi-ui/portfolio/InterestTokenPortfolio/InterestTokenPortfolio";
import { LiquidityPositionPortfolio } from "efi-ui/portfolio/LiquidityPositionPortfolio/LiquidityPositionPortfolio";
import { PortfolioTab } from "efi-ui/portfolio/PortfolioTabs/PortfolioTabs";
import { PrincipalTokenPortfolio } from "efi-ui/portfolio/PrincipalTokenPortfolio/PrincipalTokenPortfolio";
import { useCurrencyPref } from "efi-ui/prefs/useCurrency/useCurencyPref";

import { useFiatBalanceAllInterestTokens } from "./useFiatBalanceAllInterestTokens";

export function usePortfolioTabs(
  library: Web3Provider | undefined,
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
          library={library}
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
        <InterestTokenPortfolio
          library={library}
          account={account}
          interestTokens={yieldTokensWithBalance}
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
  const totalFiatBalanceAllTranches = useFiatBalanceAllTranches(
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
  const yieldTokensWithBalance = useInterestTokensWithBalance(
    account,
    provider
  );
  const totalFiatBalanceAllYieldTokens = useFiatBalanceAllInterestTokens(
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
