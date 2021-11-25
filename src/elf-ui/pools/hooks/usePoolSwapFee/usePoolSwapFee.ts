import { ConvergentCurvePool } from "elf-contracts-typechain/dist/types/ConvergentCurvePool";
import { WeightedPool } from "elf-contracts-typechain/dist/types/WeightedPool";
import { BigNumber } from "ethers";

import { useSmartContractReadCall } from "elf-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { isConvergentCurvePool, isWeightedPool } from "elf/pools/PoolContract";
import { PoolInfo } from "elf/pools/PoolInfo";
import { getPoolContract } from "elf/pools/getPoolContract";

export function usePoolSwapFee(poolInfo: PoolInfo): BigNumber | undefined {
  const pool = getPoolContract(poolInfo.address);
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
