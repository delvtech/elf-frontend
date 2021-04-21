import React from "react";

import { Provider, Web3Provider } from "@ethersproject/providers";
import { AbstractConnector } from "@web3-react/abstract-connector";
import { InterestToken } from "elf-contracts/types/InterestToken";
import { Tranche } from "elf-contracts/types/Tranche";
import { Money } from "ts-money";
import { t } from "ttag";

import { ERC20Shim } from "efi-ui/contracts/ERC20Shim";
import { useInterestTokenContracts } from "efi-ui/interestToken/useInterestTokens/useInterestTokens";
import { useConvergentCurvePoolsWithLPBalance } from "efi-ui/portfolio/hooks/useConvergentCurvePoolsWithLPBalance";
import { useTotalFiatBalance } from "efi-ui/portfolio/hooks/useTotalFiatBalance";
import { useTotalLiquidityProvidedMulti } from "efi-ui/portfolio/hooks/useTotalLiquidityProvidedMulti";
import { useWeightedPoolsWithLPBalance } from "efi-ui/portfolio/hooks/useWeightedPoolsWithLPBalance";
import { LiquidityPositionPortfolio } from "efi-ui/portfolio/LiquidityPositionPortfolio/LiquidityPositionPortfolio";
import { PortfolioTab } from "efi-ui/portfolio/PortfolioTabs/PortfolioTabs";
import { PrincipalTokenPortfolio } from "efi-ui/portfolio/PrincipalTokenPortfolio/PrincipalTokenPortfolio";
import { YieldTokenPortfolio } from "efi-ui/portfolio/YieldTokenPortfolio/YieldTokenPortfolio";
import { useCurrencyPref } from "efi-ui/prefs/useCurrency/useCurencyPref";
import { useTokensWithBalance } from "efi-ui/token/hooks/useTokensWithBalance";
import { useTrancheContracts } from "efi-ui/tranche/useTrancheContracts";

export function usePortfolioTabs(
  chainId: number | undefined,
  library: Web3Provider | undefined,
  connector: AbstractConnector | undefined,
  walletConnectionActive: boolean,
  account: string | null | undefined,
  provider?: Provider
): PortfolioTab[] {
  const {
    tranchesWithBalance,
    totalFiatBalanceAllTranches,
  } = usePrincipalTokenTab(library, account, provider);

  const {
    yieldTokensWithBalance,
    totalFiatBalanceAllYieldTokens,
  } = useYieldTokenTab(library, account, provider);

  const {
    convergentCurvePoolsWithLPBalance,
    weightedPoolsWithLPBalance,
    totalLiquidityProvided,
  } = useLPTokenTab(library, account, provider);

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
          chainId={chainId}
          library={library}
          connector={connector}
          account={account}
          walletConnectionActive={walletConnectionActive}
          yieldTokens={yieldTokensWithBalance}
        />
      ),
    },
    {
      id: "staked-positions",
      name: t`Staked positions`,
      quantity:
        convergentCurvePoolsWithLPBalance.length +
        weightedPoolsWithLPBalance.length,
      totalFiatValue: totalLiquidityProvided,
      contentRenderer: () => (
        <LiquidityPositionPortfolio
          chainId={chainId}
          library={library}
          connector={connector}
          walletConnectionActive={walletConnectionActive}
          principalTokenPools={convergentCurvePoolsWithLPBalance}
          yieldTokenPools={weightedPoolsWithLPBalance}
          account={account}
        />
      ),
    },
  ];
}

function usePrincipalTokenTab(
  library: Web3Provider | undefined,
  account: string | null | undefined,
  provider?: Provider
) {
  const trancheContracts = useTrancheContracts();
  const tranchesWithBalanceResults = useTokensWithBalance(
    account,
    (trancheContracts as unknown) as ERC20Shim[],
    provider
  );

  const tranchesWithBalance = tranchesWithBalanceResults.map(
    ({ token }) => (token as unknown) as Tranche
  );

  const totalFiatBalanceAllTranches = useTotalFiatBalance(
    library,
    account,
    tranchesWithBalance
  );

  return { tranchesWithBalance, totalFiatBalanceAllTranches };
}

function useYieldTokenTab(
  library: Web3Provider | undefined,
  account: string | null | undefined,
  provider?: Provider
) {
  const yieldTokens = useInterestTokenContracts();

  const yieldTokensWithBalanceResults = useTokensWithBalance(
    account,
    (yieldTokens as unknown) as ERC20Shim[],
    provider
  );

  const yieldTokensWithBalance = yieldTokensWithBalanceResults.map(
    ({ token }) => (token as unknown) as InterestToken
  );

  const totalFiatBalanceAllYieldTokens = useTotalFiatBalance(
    library,
    account,
    yieldTokensWithBalance
  );

  return {
    yieldTokensWithBalance,
    totalFiatBalanceAllYieldTokens,
  };
}

function useLPTokenTab(
  library: Web3Provider | undefined,
  account: string | null | undefined,
  provider?: Provider
) {
  const { currency } = useCurrencyPref();
  const convergentCurvePoolsWithLPBalance = useConvergentCurvePoolsWithLPBalance(
    account
  );
  const weightedPoolsWithLPBalance = useWeightedPoolsWithLPBalance(account);

  const totalLiquidityConvergentCurvePools = useTotalLiquidityProvidedMulti(
    convergentCurvePoolsWithLPBalance,
    account
  );
  const totalLiquidityWeightedPools = useTotalLiquidityProvidedMulti(
    weightedPoolsWithLPBalance,
    account
  );

  const totalLiquidityProvided = [
    ...totalLiquidityConvergentCurvePools,
    ...totalLiquidityWeightedPools,
  ]
    .filter((v): v is Money => !!v)
    .reduce((prevSum, currentValue) => {
      return prevSum.add(currentValue);
    }, Money.fromDecimal(0, currency.code));

  return {
    convergentCurvePoolsWithLPBalance,
    weightedPoolsWithLPBalance,
    totalLiquidityProvided,
  };
}
