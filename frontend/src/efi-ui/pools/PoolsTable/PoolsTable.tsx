import { Fragment, ReactElement } from "react";

import { Provider } from "@ethersproject/providers";
import { ConvergentCurvePool } from "elf-contracts/types/ConvergentCurvePool";
import { WeightedPool } from "elf-contracts/types/WeightedPool";
import { Signer } from "ethers";

import tw from "efi-tailwindcss-classnames";
import { InterestPoolCard } from "efi-ui/pools/PoolsTable/InterestPoolCard";
import { PrincipalPoolCard } from "efi-ui/pools/PoolsTable/PrincipalPoolCard";
import { principalPoolContracts } from "efi/pools/ccpool";
import { yieldPoolContracts } from "efi/pools/weightedPool";

interface PoolsTableProps {
  className?: string;
  signerOrProvider?: Signer | Provider;
  isYieldPools?: boolean;
}

export function PoolsTable({
  signerOrProvider,
  isYieldPools,
}: PoolsTableProps): ReactElement {
  return (
    <div
      className={tw("flex", "flex-col", "items-center", "w-full", "space-y-5")}
    >
      <Fragment>
        {isYieldPools
          ? yieldPoolContracts
              .filter((pool): pool is WeightedPool => !!pool)
              .map((pool, index) => {
                return (
                  <InterestPoolCard key={pool?.address || index} pool={pool} />
                );
              })
          : principalPoolContracts
              .filter((pool): pool is ConvergentCurvePool => !!pool)
              .map((pool, index) => {
                return (
                  <PrincipalPoolCard key={pool?.address || index} pool={pool} />
                );
              })}
      </Fragment>
    </div>
  );
}
