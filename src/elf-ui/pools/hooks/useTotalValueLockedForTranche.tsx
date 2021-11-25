import { ERC20 } from "elf-contracts-typechain/dist/types/ERC20";
import { formatUnits } from "ethers/lib/utils";
import { PrincipalTokenInfo, YieldPoolTokenInfo } from "tokenlists/types";
import { Money } from "ts-money";

import { useSmartContractReadCall } from "elf-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { useAccumulatedInterestForTranche } from "elf-ui/pools/hooks/useAccumulatedInterestForTranche";
import { usePoolTokens } from "elf-ui/pools/hooks/usePoolTokens/usePoolTokens";
import { useCurrencyPref } from "elf-ui/prefs/useCurrency/useCurencyPref";
import { useTokenPrice } from "elf-ui/token/hooks/useTokenPrice";
import { getPoolInfoForPrincipalToken } from "elf/pools/ccpool";
import { getPoolContract } from "elf/pools/getPoolContract";
import { getPoolTokens } from "elf/pools/getPoolTokens";
import { PoolInfo } from "elf/pools/PoolInfo";
import { getPoolForYieldToken } from "elf/pools/weightedPool";
import { getTokenInfo } from "elf/tokenlists";
import { trancheContractsByAddress } from "elf/tranche/tranches";
import { useMemo } from "react";

export function useTotalValueLockedForTranche(
  trancheInfo: PrincipalTokenInfo,
  baseAssetContract: ERC20
): Money | undefined {
  const { address, decimals } = trancheInfo;
  const tranche = trancheContractsByAddress[address];
  const poolInfo = getPoolInfoForPrincipalToken(address);
  const { address: yieldPoolAddress } = getPoolForYieldToken(
    trancheInfo.extensions.interestToken
  );
  const yieldPoolInfo = getTokenInfo<YieldPoolTokenInfo>(yieldPoolAddress);

  // get all components of TVL: base asset in tranche, base asset in pool, accumulated interest for tranche
  const { data: baseAssetLockedBN } = useSmartContractReadCall(
    tranche,
    "valueSupplied"
  );
  const accumulatedInterestBN = useAccumulatedInterestForTranche(poolInfo);
  const baseReservesInPrincipalPoolBN = useBaseAssetReservesInPool(poolInfo);
  const baseReservesInYieldPoolBN = useBaseAssetReservesInPool(yieldPoolInfo);

  const { currency } = useCurrencyPref();
  const { data: baseAssetPrice } = useTokenPrice(baseAssetContract, currency);

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
  const totalFiatValueLocked = useMemo(() => {
    const tvl =
      baseAssetLocked +
      accumulatedInterest +
      baseReservesInPrincipalPool +
      baseReservesInYieldPool;
    return baseAssetPrice?.multiply(tvl, Math.round);
  }, [
    accumulatedInterest,
    baseAssetLocked,
    baseAssetPrice,
    baseReservesInPrincipalPool,
    baseReservesInYieldPool,
  ]);

  if (
    !baseAssetLockedBN ||
    !accumulatedInterestBN ||
    !baseReservesInPrincipalPoolBN ||
    !baseReservesInYieldPoolBN
  ) {
    return undefined;
  }

  return totalFiatValueLocked;
}
function useBaseAssetReservesInPool(poolInfo: PoolInfo) {
  const pool = getPoolContract(poolInfo.address);
  const { data: [, balances] = [undefined, undefined] } = usePoolTokens(pool);
  const { baseAssetIndex } = getPoolTokens(poolInfo);
  return balances?.[baseAssetIndex];
}
