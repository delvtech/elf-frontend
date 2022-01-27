import { PrincipalTokenInfo } from "@elementfi/tokenlist";
import { formatUnits } from "ethers/lib/utils";
import { Money } from "ts-money";

import { getPoolInfoForPrincipalToken } from "efi/pools/ccpool";
import { fetchBaseAssetReservesInPool } from "efi/pools/fetchBaseAssetReservesInPool";
import { getPoolInfoForYieldToken } from "efi/pools/weightedPool";
import { fetchAccumulatedInterestForTranche } from "efi/tranche/fetchAccumulatedInterestForTranche";
import { trancheContractsByAddress } from "efi/tranche/tranches";

export async function fetchTotalValueLockedForTerm(
  trancheInfo: PrincipalTokenInfo,
  baseAssetPrice: Money
): Promise<Money> {
  const { address, decimals } = trancheInfo;
  const tranche = trancheContractsByAddress[address];
  const poolInfo = getPoolInfoForPrincipalToken(address);
  const yieldPoolInfo = getPoolInfoForYieldToken(
    trancheInfo.extensions.interestToken
  );

  // get all components of TVL: base asset in tranche, base asset in pool, accumulated interest for
  // tranche
  const baseAssetLockedBNPromise = tranche.valueSupplied();
  const accumulatedInterestBNPromise =
    fetchAccumulatedInterestForTranche(poolInfo);
  const baseReservesInPrincipalPoolBNPromise =
    fetchBaseAssetReservesInPool(poolInfo);

  // there might not be a yield pool associated with a term
  const baseReservesInYieldPoolBNPromise = yieldPoolInfo
    ? fetchBaseAssetReservesInPool(yieldPoolInfo)
    : Promise.resolve(undefined);

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
