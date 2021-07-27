import { ConvergentCurvePool } from "elf-contracts-typechain/dist/types/ConvergentCurvePool";
import { WeightedPool } from "elf-contracts-typechain/dist/types/WeightedPool";
import { BigNumber } from "ethers";

import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { isConvergentCurvePool, isWeightedPool } from "efi/pools/PoolContract";
import { PoolInfo } from "efi/pools/PoolInfo";
import { getPoolContract } from "efi/pools/getPoolContract";

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
