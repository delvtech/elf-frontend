import { Fragment, ReactElement } from "react";

import { Provider, Web3Provider } from "@ethersproject/providers";
import { AbstractConnector } from "@web3-react/abstract-connector";
import { Signer } from "ethers";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { MintPoolCard } from "efi-ui/pools/PoolsTable/MintPoolCard";
import { PrincipalPoolCard } from "efi-ui/pools/PoolsTable/PrincipalPoolCard";
import { InterestPoolCard } from "efi-ui/pools/PoolsTable/InterestPoolCard";
import { useConvergentCurvePools } from "efi-ui/pools/useConvergentCurvePools/useConvergentCurvePools";
import { useWeightedPools } from "efi-ui/pools/useWeightedPools/useWeightedPools";
import { WeightedPool } from "elf-contracts/types/WeightedPool";
import { ConvergentCurvePool } from "elf-contracts/types/ConvergentCurvePool";

interface PoolsTableProps {
  className?: string;
  signerOrProvider?: Signer | Provider;
  isYieldPools?: boolean;
  isMintPage?: boolean;
  library: Web3Provider | undefined;
  account: string | null | undefined;
  chainId: number | undefined;
  walletConnectionActive: boolean;
  connector: AbstractConnector | undefined;
}

export function PoolsTable({
  className,
  signerOrProvider,
  isYieldPools,
  isMintPage,
  library,
  account,
  walletConnectionActive,
  chainId,
  connector,
}: PoolsTableProps): ReactElement {
  const principalTokenPools = useConvergentCurvePools(signerOrProvider);
  const interestTokenPools = useWeightedPools(signerOrProvider);

  return (
    <div
      className={tw("flex", "flex-col", "items-center", "w-full", "space-y-5")}
    >
      <Fragment>
        {isMintPage
          ? interestTokenPools
              .filter((pool): pool is WeightedPool => !!pool)
              .map((pool, index) => {
                return (
                  <MintPoolCard
                    key={pool?.contractAddress || index}
                    pool={pool}
                    library={library}
                    account={account}
                    walletConnectionActive={walletConnectionActive}
                    chainId={chainId}
                    connector={connector}
                  />
                );
              })
          : isYieldPools
          ? interestTokenPools
              .filter((pool): pool is WeightedPool => !!pool)
              .map((pool, index) => {
                return (
                  <InterestPoolCard
                    key={pool?.contractAddress || index}
                    pool={pool}
                  />
                );
              })
          : principalTokenPools
              .filter((pool): pool is ConvergentCurvePool => !!pool)
              .map((pool, index) => {
                return (
                  <PrincipalPoolCard
                    key={pool?.contractAddress || index}
                    pool={pool}
                  />
                );
              })}
      </Fragment>
    </div>
  );
}
