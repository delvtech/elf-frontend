import { Fragment, ReactElement } from "react";

import { Provider } from "@ethersproject/providers";
import { ConvergentCurvePool } from "elf-contracts/types/ConvergentCurvePool";
import { WeightedPool } from "elf-contracts/types/WeightedPool";
import { Signer } from "ethers";

import tw from "efi-tailwindcss-classnames";
import { InterestPoolCard } from "efi-ui/pools/PoolsTable/InterestPoolCard";
import { PrincipalPoolCard } from "efi-ui/pools/PoolsTable/PrincipalPoolCard";
import { useConvergentCurvePools } from "efi-ui/pools/useConvergentCurvePools/useConvergentCurvePools";
import { useWeightedPools } from "efi-ui/pools/useWeightedPools/useWeightedPools";

interface PoolsTableProps {
  className?: string;
  signerOrProvider?: Signer | Provider;
  isYieldPools?: boolean;
}

export function PoolsTable({
  signerOrProvider,
  isYieldPools,
}: PoolsTableProps): ReactElement {
  const principalTokenPools = useConvergentCurvePools(signerOrProvider);
  const interestTokenPools = useWeightedPools(signerOrProvider);

  return (
    <div
      className={tw("flex", "flex-col", "items-center", "w-full", "space-y-5")}
    >
      <Fragment>
        {isYieldPools
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
