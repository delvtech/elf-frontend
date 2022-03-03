import { formatUnits } from "ethers/lib/utils";
import { Money } from "ts-money";

import { fetchAccumulatedInterestForTranche } from "efi/tranche/fetchAccumulatedInterestForTranche";
import { getPoolInfoForPrincipalToken } from "efi/pools/ccpool";
import { fetchBaseAssetReservesInPool } from "efi/pools/fetchBaseAssetReservesInPool";
import { getPoolForYieldToken } from "efi/pools/weightedPool";
import { getTokenInfo } from "tokenlists/tokenlists";
import { trancheContractsByAddress } from "efi/tranche/tranches";
import { PrincipalTokenInfo, YieldPoolTokenInfo } from "@elementfi/tokenlist";

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
