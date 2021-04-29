import { ConvergentCurvePool } from "elf-contracts/types/ConvergentCurvePool";
import { WeightedPool } from "elf-contracts/types/WeightedPool";
import { BigNumber } from "ethers";

import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import {
  isConvergentCurvePool,
  isWeightedPool,
  PoolContract,
} from "efi/pools/PoolContract";

export function useSwapFee(
  pool: PoolContract | undefined
): BigNumber | undefined {
  const { data: swapFee } = useSmartContractReadCall(
    pool as WeightedPool,
    "getSwapFeePercentage",
    {
      enabled: isWeightedPool(pool),
    }
  );

  const { data: percentFee } = useSmartContractReadCall(
    pool as ConvergentCurvePool,
    "percentFee",
    {
      enabled: isConvergentCurvePool(pool),
    }
  );

  if (isWeightedPool(pool)) {
    return swapFee;
  }

  if (isConvergentCurvePool(pool)) {
    return percentFee;
  }
}
