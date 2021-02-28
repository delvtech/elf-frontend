import React from "react";

import { Provider } from "@ethersproject/providers";
import { Money } from "ts-money";
import { t } from "ttag";

import { FYTPortfolio } from "efi-ui/portfolio/FYTPortfolio/FYTPortfolio";
import { useFiatBalanceAllTranches } from "efi-ui/portfolio/hooks/useTotalFYTFiatBalance";
import { useTranchesWithBalance } from "efi-ui/portfolio/hooks/useTranchesWithBalance";
import { LiquidityPositionPortfolio } from "efi-ui/portfolio/LiquidityPositionPortfolio/LiquidityPositionPortfolio";
import { PortfolioTab } from "efi-ui/portfolio/PortfolioTabs/PortfolioTabs";
import { YCPortfolio } from "efi-ui/portfolio/YCPortfolio/YCPortfolio";
import { useCurrencyPref } from "efi-ui/prefs/useCurrency/useCurencyPref";
import { useYCsWithBalance } from "efi-ui/yieldcoupon/useYCsWithBalance/useYCsWithBalance";
import { useYieldCouponsTotalFiatBalance } from "./useYieldCouponsTotalFiatBalance";

export function usePortfolioTabs(
  account: string | null | undefined,
  provider?: Provider
): PortfolioTab[] {
  const { currency } = useCurrencyPref();
  const { tranchesWithBalance, totalFiatBalanceAllTranches } = useFYTTab(
    account,
    provider
  );
  const { ycsWithBalance, totalFiatBalanceAllYCs } = useYCTab(
    account,
    provider
  );

  return [
    {
      id: "fixed-yield-tokens",
      name: t`Fixed Yield Tokens`,
      quantity: tranchesWithBalance.length,
      totalFiatValue: totalFiatBalanceAllTranches,
      contentRenderer: () => (
        <FYTPortfolio account={account} tranches={tranchesWithBalance} />
      ),
    },
    {
      id: "yield-coupons",
      name: t`Yield Coupons`,
      quantity: ycsWithBalance.length,
      totalFiatValue: totalFiatBalanceAllYCs,
      contentRenderer: () => (
        <YCPortfolio account={account} yieldCoupons={ycsWithBalance} />
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

function useFYTTab(account: string | null | undefined, provider?: Provider) {
  const tranchesWithBalance = useTranchesWithBalance(account, provider);
  const totalFiatBalanceAllTranches = useFiatBalanceAllTranches(account);

  return { tranchesWithBalance, totalFiatBalanceAllTranches };
}

function useYCTab(account: string | null | undefined, provider?: Provider) {
  const ycsWithBalance = useYCsWithBalance(account, provider);
  const totalFiatBalanceAllYCs = useYieldCouponsTotalFiatBalance(
    account,
    ycsWithBalance
  );

  return { ycsWithBalance, totalFiatBalanceAllYCs };
}
