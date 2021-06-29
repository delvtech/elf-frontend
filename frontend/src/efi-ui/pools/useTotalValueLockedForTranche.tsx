import { ERC20 } from "elf-contracts/types/ERC20";
import { formatUnits } from "ethers/lib/utils";
import { PrincipalTokenInfo, YieldPoolTokenInfo } from "tokenlists/types";
import { Money } from "ts-money";

import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { useAccumulatedInterestForTranche } from "efi-ui/pools/useAccumulatedInterestForTranche";
import { usePoolTokens } from "efi-ui/pools/usePoolTokens/usePoolTokens";
import { useCurrencyPref } from "efi-ui/prefs/useCurrency/useCurencyPref";
import { useTokenPrice } from "efi-ui/token/hooks/useTokenPrice";
import { getPoolInfoForPrincipalToken } from "efi/pools/ccpool";
import { getPoolContract } from "efi/pools/getPoolContract";
import { getPoolTokens } from "efi/pools/getPoolTokens";
import { PoolInfo } from "efi/pools/PoolInfo";
import { getPoolForYieldToken } from "efi/pools/weightedPool";
import { getTokenInfo } from "efi/tokenlists";
import { trancheContractsByAddress } from "efi/tranche/tranches";

export function useTotalValueLockedForTranche(
  trancheInfo: PrincipalTokenInfo,
  baseAssetContract: ERC20 | undefined
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
  const baseReservesInPrincipalPoolBN = useBaseAssetReservesInPool(
    poolInfo,
    decimals
  );
  const baseReservesInYieldPoolBN = useBaseAssetReservesInPool(
    yieldPoolInfo,
    decimals
  );

  const { currency } = useCurrencyPref();
  const { data: baseAssetPrice } = useTokenPrice(baseAssetContract, currency);

  if (
    !baseAssetLockedBN ||
    !accumulatedInterestBN ||
    !baseReservesInPrincipalPoolBN ||
    !baseReservesInYieldPoolBN
  ) {
    return undefined;
  }

  // convert to numbers
  const baseAssetLocked = +formatUnits(baseAssetLockedBN, decimals);
  const accumulatedInterest = +formatUnits(accumulatedInterestBN, decimals);
  const baseReservesInPrincipalPool = +formatUnits(
    baseReservesInPrincipalPoolBN,
    decimals
  );
  const baseReservesInYieldPool = +formatUnits(
    baseReservesInYieldPoolBN,
    decimals
  );

  // get total, convert to fiat
  const totalValueLocked =
    baseAssetLocked +
    accumulatedInterest +
    baseReservesInPrincipalPool +
    baseReservesInYieldPool;
  const totalFiatValueLocked = baseAssetPrice?.multiply(
    totalValueLocked,
    Math.round
  );

  return totalFiatValueLocked;
}
function useBaseAssetReservesInPool(poolInfo: PoolInfo, decimals: number) {
  const pool = getPoolContract(poolInfo.address);
  const { data: [, balances] = [undefined, undefined] } = usePoolTokens(pool);
  const { baseAssetIndex } = getPoolTokens(poolInfo);
  return balances?.[baseAssetIndex];
}
