import { ReactElement } from "react";

import { Provider } from "@ethersproject/providers";
import { Signer } from "ethers";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { PrincipalPoolCard } from "efi-ui/pools/PoolsTable/PrincipalPoolCard";
import { useConvergentCurvePools } from "efi-ui/pools/useConvergentCurvePools/useConvergentCurvePools";
import { useWeightedPools } from "efi-ui/pools/useWeightedPools/useWeightedPools";

interface PoolsTableProps {
  className?: string;
  signerOrProvider?: Signer | Provider;
}

export function PoolsTable({
  className,
  signerOrProvider,
}: PoolsTableProps): ReactElement {
  const principalTokenPools = useConvergentCurvePools(signerOrProvider);
  const interestTokenPools = useWeightedPools(signerOrProvider);

  if (!principalTokenPools.length && !interestTokenPools.length) {
    return <span>{t`no markets found`}</span>;
  }

  return (
    <div className={tw("w-full", "space-y-2")}>
      {principalTokenPools.map((pool, index) => {
        return (
          <PrincipalPoolCard key={pool?.contractAddress || index} pool={pool} />
        );
      })}
      {/* {interestTokenPools.map((pool, index) => {
        return (
          <InterestTokenPoolCard
            key={pool?.contractAddress || index}
            pool={pool}
          />
        );
      })} */}
    </div>
  );
}
