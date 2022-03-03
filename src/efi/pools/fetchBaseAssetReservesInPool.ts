import { BigNumber } from "ethers";
import { balancerVaultContract } from "integrations/efi-balancer/vault";
import { getPoolTokens } from "efi/pools/getPoolTokens";
import { PoolInfo } from "efi/pools/PoolInfo";

export async function fetchBaseAssetReservesInPool(
  poolInfo: PoolInfo
): Promise<BigNumber> {
  const [, balances] = await balancerVaultContract.getPoolTokens(
    poolInfo.extensions.poolId
  );
  const { baseAssetIndex } = getPoolTokens(poolInfo);
  return balances?.[baseAssetIndex];
}
