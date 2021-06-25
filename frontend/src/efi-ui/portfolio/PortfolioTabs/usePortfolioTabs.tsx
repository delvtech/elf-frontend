import React from "react";

import { Provider, Web3Provider } from "@ethersproject/providers";
import { AbstractConnector } from "@web3-react/abstract-connector";
import { Money } from "ts-money";
import { t } from "ttag";

import { LiquidityPositionPortfolio } from "efi-ui/portfolio/LiquidityPositionPortfolio/LiquidityPositionPortfolio";
import { PortfolioTab } from "efi-ui/portfolio/PortfolioTabs/PortfolioTabs";
import { PrincipalTokenPortfolio } from "efi-ui/portfolio/PrincipalTokenPortfolio/PrincipalTokenPortfolio";
import { YieldTokenPortfolio } from "efi-ui/portfolio/YieldTokenPortfolio/YieldTokenPortfolio";

export function usePortfolioTabs(
  chainId: number | undefined,
  library: Web3Provider | undefined,
  connector: AbstractConnector | undefined,
  walletConnectionActive: boolean,
  account: string | null | undefined,
  provider?: Provider
): PortfolioTab[] {
  return [
    {
      id: "principal-tokens",
      name: t`Principal Tokens`,
      quantity: 0,
      totalFiatValue: Money.fromDecimal(0, "USD"),
      contentRenderer: () => (
        <PrincipalTokenPortfolio
          chainId={chainId}
          library={library}
          provider={provider}
          account={account}
        />
      ),
    },
    {
      id: "yield-tokens",
      name: t`Yield Tokens`,
      quantity: 0,
      totalFiatValue: Money.fromDecimal(0, "USD"),
      contentRenderer: () => (
        <YieldTokenPortfolio
          chainId={chainId}
          library={library}
          connector={connector}
          account={account}
          walletConnectionActive={walletConnectionActive}
          yieldTokens={[]}
        />
      ),
    },
    {
      id: "lp-positions",
      name: t`LP Positions`,
      quantity: 0,
      totalFiatValue: Money.fromDecimal(0, "USD"),
      contentRenderer: () => (
        <LiquidityPositionPortfolio
          chainId={chainId}
          library={library}
          provider={provider}
          connector={connector}
          walletConnectionActive={walletConnectionActive}
          account={account}
        />
      ),
    },
  ];
}
