import React, { Fragment, ReactElement } from "react";

import { t } from "ttag";

import tw from "elf-tailwindcss-classnames";
import { useConvergentCurvePoolsWithLPBalance } from "elf-ui/portfolio/hooks/useConvergentCurvePoolsWithLPBalance";
import { useWeightedPoolsWithLPBalance } from "elf-ui/portfolio/hooks/useWeightedPoolsWithLPBalance";
import { PrincipalTokenLPCard } from "elf-ui/portfolio/LiquidityPositionCard/PrincipalTokenLPCard";
import { YieldTokenLPCard } from "elf-ui/portfolio/LiquidityPositionCard/YieldTokenLPCard";
import { NoLPsInWalletNonIdealState } from "elf-ui/wallets/NoLPsInWalletNonIdealState/NoLPsInWalletNonIdealState";

interface LiquidityPositionPortfolioProps {
  account: string | null | undefined;
}

export function LiquidityPositionPortfolio({
  account,
}: LiquidityPositionPortfolioProps): ReactElement {
  const principalTokenPools = useConvergentCurvePoolsWithLPBalance(account);
  const yieldTokenPools = useWeightedPoolsWithLPBalance(account);

  const hasLPs = principalTokenPools.length + yieldTokenPools.length > 0;
  let nonIdealStateContent = null;
  if (!account) {
    nonIdealStateContent = (
      <span>{t`Connect your wallet to view your portfolio`}</span>
    );
  }
  // else if because the wallet connection non ideal state is higher priority
  else if (!hasLPs) {
    nonIdealStateContent = <NoLPsInWalletNonIdealState />;
  }

  return (
    <div className={tw("flex", "flex-1", "flex-wrap", "justify-center")}>
      {nonIdealStateContent ? (
        <div className={tw("flex", "flex-1", "justify-center", "items-center")}>
          {nonIdealStateContent}
        </div>
      ) : (
        <Fragment>
          {principalTokenPools.map((pool) => [
            <div key={pool.address}>
              <PrincipalTokenLPCard account={account} pool={pool} />
            </div>,
          ])}
          {yieldTokenPools.map((pool) => [
            <div key={pool.address}>
              <YieldTokenLPCard account={account} pool={pool} />
            </div>,
          ])}
        </Fragment>
      )}
    </div>
  );
}
