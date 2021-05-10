import React, { Fragment, ReactElement } from "react";

import { Provider, Web3Provider } from "@ethersproject/providers";
import { AbstractConnector } from "@web3-react/abstract-connector";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { useConvergentCurvePoolsWithLPBalance } from "efi-ui/portfolio/hooks/useConvergentCurvePoolsWithLPBalance";
import { useWeightedPoolsWithLPBalance } from "efi-ui/portfolio/hooks/useWeightedPoolsWithLPBalance";
import { PrincipalTokenLPCard } from "efi-ui/portfolio/LiquidityPositionCard/PrincipalTokenLPCard";
import { YieldTokenLPCard } from "efi-ui/portfolio/LiquidityPositionCard/YieldTokenLPCard";
import { NoLPsInWalletNonIdealState } from "efi-ui/wallets/NoLPsInWalletNonIdealState/NoLPsInWalletNonIdealState";
import { NoWalletConnectedNonIdealState } from "efi-ui/wallets/NoWalletConnectedNonIdealState/NoWalletConnectedNonIdealState";

interface LiquidityPositionPortfolioProps {
  chainId: number | undefined;
  library: Web3Provider | undefined;
  provider: Provider | undefined;
  connector: AbstractConnector | undefined;
  walletConnectionActive: boolean;
  account: string | null | undefined;
}

export function LiquidityPositionPortfolio({
  chainId,
  library,
  connector,
  provider,
  walletConnectionActive,
  account,
}: LiquidityPositionPortfolioProps): ReactElement {
  const {
    convergentCurvePoolsWithLPBalance: principalTokenPools,
    weightedPoolsWithLPBalance: yieldTokenPools,
  } = useLPTokenTab(library, account, provider);

  const hasLPs = principalTokenPools.length + yieldTokenPools.length > 0;
  let nonIdealStateContent = null;
  if (!account) {
    nonIdealStateContent = (
      <NoWalletConnectedNonIdealState
        title={t`Connect your wallet to view your portfolio`}
      />
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
              <PrincipalTokenLPCard
                library={library}
                connector={connector}
                account={account}
                pool={pool}
              />
            </div>,
          ])}
          {yieldTokenPools.map((pool) => [
            <div key={pool.address}>
              <YieldTokenLPCard
                library={library}
                connector={connector}
                account={account}
                pool={pool}
              />
            </div>,
          ])}
        </Fragment>
      )}
    </div>
  );
}

function useLPTokenTab(
  library: Web3Provider | undefined,
  account: string | null | undefined,
  provider?: Provider
) {
  // const { currency } = useCurrencyPref();
  const convergentCurvePoolsWithLPBalance =
    useConvergentCurvePoolsWithLPBalance(account);
  const weightedPoolsWithLPBalance = useWeightedPoolsWithLPBalance(account);

  // const totalLiquidityConvergentCurvePools = useTotalLiquidityProvidedMulti(
  //   convergentCurvePoolsWithLPBalance,
  //   account
  // );
  // const totalLiquidityWeightedPools = useTotalLiquidityProvidedMulti(
  //   weightedPoolsWithLPBalance,
  //   account
  // );

  // const totalLiquidityProvided = [
  //   ...totalLiquidityConvergentCurvePools,
  //   ...totalLiquidityWeightedPools,
  // ]
  //   .filter((v): v is Money => !!v)
  //   .reduce((prevSum, currentValue) => {
  //     return prevSum.add(currentValue);
  //   }, Money.fromDecimal(0, currency.code));

  return {
    convergentCurvePoolsWithLPBalance,
    weightedPoolsWithLPBalance,
    // totalLiquidityProvided,
  };
}
