import React from "react";

import { Provider, Web3Provider } from "@ethersproject/providers";
import { AbstractConnector } from "@web3-react/abstract-connector";
import { InterestToken } from "elf-contracts/types/InterestToken";
import { Tranche } from "elf-contracts/types/Tranche";
import { Money } from "ts-money";
import { t } from "ttag";

import { ERC20Shim } from "efi-ui/contracts/ERC20Shim";
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
import { useTokenDecimalsMulti } from "efi-ui/token/hooks/useTokenDecimalsMulti";
import { getQueriesData } from "efi-ui/base/queryResults";
import zip from "lodash.zip";
import { ERC20 } from "elf-contracts/types/ERC20";
import { BigNumber } from "ethers";
import { isDust } from "efi/coins/isDust";
import { InterestTokenContracts, TrancheContracts } from "efi/tranche/tranches";

export function usePortfolioTabs(
  chainId: number | undefined,
  library: Web3Provider | undefined,
  connector: AbstractConnector | undefined,
  walletConnectionActive: boolean,
  account: string | null | undefined,
  provider?: Provider
): PortfolioTab[] {
  const {
    principalTokens,
    totalFiatBalanceAllPrincipalTokens,
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
      quantity: principalTokens.length,
      totalFiatValue: totalFiatBalanceAllPrincipalTokens,
      contentRenderer: () => (
        <PrincipalTokenPortfolio
          chainId={chainId}
          library={library}
          account={account}
          tranches={principalTokens}
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
  const principalTokenDecimalResults = useTokenDecimalsMulti(TrancheContracts);
  const principalTokenDecimals = getQueriesData(principalTokenDecimalResults);
  const principalTokensWithBalanceResults = useTokensWithBalance(
    account,
    (TrancheContracts as unknown) as ERC20Shim[],
    provider
  );

  // filter out dust, because redeeming a PT can leave a small amount of dust in
  // the user's account
  const principalTokensWithoutDust = zip(
    principalTokensWithBalanceResults,
    principalTokenDecimals
  )
    .filter((zipped): zipped is [
      { token: ERC20; balanceOf: BigNumber },
      number
    ] => zipped.every((v) => !!v))
    .filter(([{ balanceOf }, decimals]) => !isDust(balanceOf, decimals))
    .map(([{ token }]) => (token as unknown) as Tranche);

  // The total fiat balance
  const totalFiatBalanceAllPrincipalTokens = useTotalFiatBalance(
    library,
    account,
    principalTokensWithoutDust
  );

  return {
    principalTokens: principalTokensWithoutDust,
    totalFiatBalanceAllPrincipalTokens,
  };
}

function useYieldTokenTab(
  library: Web3Provider | undefined,
  account: string | null | undefined,
  provider?: Provider
) {
  const yieldTokensWithBalanceResults = useTokensWithBalance(
    account,
    (InterestTokenContracts as unknown) as ERC20Shim[],
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
