import React from "react";

import { Provider, Web3Provider } from "@ethersproject/providers";
import { Money } from "ts-money";
import { t } from "ttag";

import { FYTPortfolio } from "efi-ui/portfolio/FYTPortfolio/FYTPortfolio";
import { useFiatBalanceAllTranches } from "efi-ui/portfolio/hooks/useTotalFYTFiatBalance";
import { useTranchesWithBalance } from "efi-ui/portfolio/hooks/useTranchesWithBalance";
import { LiquidityPositionPortfolio } from "efi-ui/portfolio/LiquidityPositionPortfolio/LiquidityPositionPortfolio";
import { PortfolioTab } from "efi-ui/portfolio/PortfolioTabs/PortfolioTabs";
import { InterestTokenPortfolio } from "efi-ui/portfolio/InterestTokenPortfolio/InterestTokenPortfolio";
import { useCurrencyPref } from "efi-ui/prefs/useCurrency/useCurencyPref";
import { useInterestTokensWithBalance } from "efi-ui/interestToken/useInterestTokensWithBalance/useInterestTokensWithBalance";

import { useFiatBalanceAllInterestTokens } from "./useFiatBalanceAllInterestTokens";

export function usePortfolioTabs(
  library: Web3Provider | undefined,
  account: string | null | undefined,
  provider?: Provider
): PortfolioTab[] {
  const { currency } = useCurrencyPref();
  const { tranchesWithBalance, totalFiatBalanceAllTranches } = useFYTTab(
    library,
    account,
    provider
  );
  const {
    interestTokensWithBalance,
    totalFiatBalanceAllInterestTokens,
  } = useInterestTokenTab(library, account, provider);

  return [
    {
      id: "fixed-yield-tokens",
      name: t`Fixed Yield Tokens`,
      quantity: tranchesWithBalance.length,
      totalFiatValue: totalFiatBalanceAllTranches,
      contentRenderer: () => (
        <FYTPortfolio
          library={library}
          account={account}
          tranches={tranchesWithBalance}
        />
      ),
    },
    {
      id: "interest-tokens",
      name: t`Interest Tokens`,
      quantity: interestTokensWithBalance.length,
      totalFiatValue: totalFiatBalanceAllInterestTokens,
      contentRenderer: () => (
        <InterestTokenPortfolio
          library={library}
          account={account}
          interestTokens={interestTokensWithBalance}
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

function useFYTTab(
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

function useInterestTokenTab(
  library: Web3Provider | undefined,
  account: string | null | undefined,
  provider?: Provider
) {
  const { currency } = useCurrencyPref();
  const interestTokensWithBalance = useInterestTokensWithBalance(
    account,
    provider
  );
  const totalFiatBalanceAllInterestTokens = useFiatBalanceAllInterestTokens(
    library,
    account,
    interestTokensWithBalance,
    currency
  );

  return { interestTokensWithBalance, totalFiatBalanceAllInterestTokens };
}
