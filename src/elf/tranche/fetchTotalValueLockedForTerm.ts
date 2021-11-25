import { formatUnits } from "ethers/lib/utils";
import { PrincipalTokenInfo, YieldPoolTokenInfo } from "tokenlists/types";
import { Money } from "ts-money";

import { fetchAccumulatedInterestForTranche } from "elf/tranche/fetchAccumulatedInterestForTranche";
import { getPoolInfoForPrincipalToken } from "elf/pools/ccpool";
import { fetchBaseAssetReservesInPool } from "elf/pools/fetchBaseAssetReservesInPool";
import { getPoolForYieldToken } from "elf/pools/weightedPool";
import { getTokenInfo } from "elf/tokenlists";
import { trancheContractsByAddress } from "elf/tranche/tranches";

export async function fetchTotalValueLockedForTerm(
  trancheInfo: PrincipalTokenInfo,
  baseAssetPrice: Money
): Promise<Money> {
  const { address, decimals } = trancheInfo;
  const tranche = trancheContractsByAddress[address];
  const poolInfo = getPoolInfoForPrincipalToken(address);
  const { address: yieldPoolAddress } = getPoolForYieldToken(
    trancheInfo.extensions.interestToken
  );
  const yieldPoolInfo = getTokenInfo<YieldPoolTokenInfo>(yieldPoolAddress);

  // get all components of TVL: base asset in tranche, base asset in pool, accumulated interest for
  // tranche
  const baseAssetLockedBNPromise = tranche.valueSupplied();
  const accumulatedInterestBNPromise =
    fetchAccumulatedInterestForTranche(poolInfo);
  const baseReservesInPrincipalPoolBNPromise =
    fetchBaseAssetReservesInPool(poolInfo);
  const baseReservesInYieldPoolBNPromise =
    fetchBaseAssetReservesInPool(yieldPoolInfo);

  const [
    baseAssetLockedBN,
    accumulatedInterestBN,
    baseReservesInPrincipalPoolBN,
    baseReservesInYieldPoolBN,
  ] = await Promise.all([
    baseAssetLockedBNPromise,
    accumulatedInterestBNPromise,
    baseReservesInPrincipalPoolBNPromise,
    baseReservesInYieldPoolBNPromise,
  ]);

  // convert to numbers
  const baseAssetLocked = +formatUnits(baseAssetLockedBN || 0, decimals);
  const accumulatedInterest = +formatUnits(
    accumulatedInterestBN || 0,
    decimals
  );
  const baseReservesInPrincipalPool = +formatUnits(
    baseReservesInPrincipalPoolBN || 0,
    decimals
  );
  const baseReservesInYieldPool = +formatUnits(
    baseReservesInYieldPoolBN || 0,
    decimals
  );

  // get total, convert to fiat
  const totalFiatValueLocked = baseAssetPrice.multiply(
    baseAssetLocked +
      accumulatedInterest +
      baseReservesInPrincipalPool +
      baseReservesInYieldPool,
    Math.round
  );

  return totalFiatValueLocked;
}
