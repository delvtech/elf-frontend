import { Fragment, ReactElement } from "react";

import { Provider } from "@ethersproject/providers";
import { Signer } from "ethers";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
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
}

export function PoolsTable({
  className,
  signerOrProvider,
  isYieldPools,
}: PoolsTableProps): ReactElement {
  const principalTokenPools = useConvergentCurvePools(signerOrProvider);
  const interestTokenPools = useWeightedPools(signerOrProvider);

  if (isYieldPools && !interestTokenPools.length) {
    return <span>{t`no markets found`}</span>;
  }

  if (!isYieldPools && !principalTokenPools.length) {
    return <span>{t`no markets found`}</span>;
  }

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
