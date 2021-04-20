import React, { ReactElement } from "react";

import { Web3Provider } from "@ethersproject/providers";
import { AbstractConnector } from "@web3-react/abstract-connector";
import { ConvergentCurvePool } from "elf-contracts/types/ConvergentCurvePool";
import { WeightedPool } from "elf-contracts/types/WeightedPool";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { LiquidityPositionCard } from "efi-ui/portfolio/LiquidityPositionCard/LiquidityPositionCard";
import { NoLPsInWalletNonIdealState } from "efi-ui/wallets/NoLPsInWalletNonIdealState/NoLPsInWalletNonIdealState";
import { NoWalletConnectedNonIdealState } from "efi-ui/wallets/NoWalletConnectedNonIdealState/NoWalletConnectedNonIdealState";

interface LiquidityPositionPortfolioProps {
  chainId: number | undefined;
  library: Web3Provider | undefined;
  connector: AbstractConnector | undefined;
  walletConnectionActive: boolean;
  account: string | null | undefined;
  principalTokenPools: ConvergentCurvePool[];
  yieldTokenPools: WeightedPool[];
}

export function LiquidityPositionPortfolio({
  chainId,
  library,
  connector,
  walletConnectionActive,
  account,
  principalTokenPools,
  yieldTokenPools,
}: LiquidityPositionPortfolioProps): ReactElement {
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
        principalTokenPools.map((pool) => [
          <div key={pool.address}>
            <LiquidityPositionCard
              chainId={chainId}
              library={library}
              connector={connector}
              walletConnectionActive={walletConnectionActive}
              account={account}
              pool={pool}
            />
          </div>,
        ])
      )}
    </div>
  );
}
