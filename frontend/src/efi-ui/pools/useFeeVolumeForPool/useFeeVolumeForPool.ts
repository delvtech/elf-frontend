import { formatEther, formatUnits } from "ethers/lib/utils";
import { Money } from "ts-money";

import { useSwapFee } from "efi-ui/pools/useSwapFee/useSwapFee";
import { useVolumeForPool } from "efi-ui/pools/useVolumeForPool/useVolumeForPool";
import { useCurrencyPref } from "efi-ui/prefs/useCurrency/useCurencyPref";
import { ONE_DAY_IN_SECONDS } from "efi/base/time";
import {
  isConvergentCurvePool,
  isWeightedPool,
  PoolContract,
} from "efi/pools/PoolContract";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { useBalancerVault } from "efi-ui/balancer/useBalancerVault";
import { usePreviousBlockNumber } from "efi-ui/ethereum/usePreviousBlockNumber/usePreviousBlockNumber";
import { useQuery } from "react-query";
import { BigNumber } from "ethers";
import { usePoolSpotPrice } from "efi-ui/pools/usePoolSpotPrice/usePoolSpotPrice";
import { useBaseAssetForPool } from "efi-ui/pools/useBaseAssetForPool/useBaseAssetForPool";
import { usePoolTokens } from "efi-ui/pools/usePoolTokens/usePoolTokens";
import { getQueryData } from "efi-ui/base/queryResults";
import { useTokenDecimals } from "efi-ui/token/hooks/useTokenDecimals";
import { useTokenPrice } from "efi-ui/token/hooks/useTokenPrice";

/**
 * Returns the fiat volume for a pool in a given time range
 * @param pool contract of the pool to query.
 * @param fromTime time in seconds previous to now to start the query
 * @param toTime time in seconds previous to now to end the query.  if no value given, ends at
 * latest block.
 * @returns {Array<BigNumber>} an array of deltas for each token in the pool
 * over the time period. values in ascending token address order.
 */
export function useFeeVolumeForPool(
  pool: PoolContract | undefined,
  fromTime: number = ONE_DAY_IN_SECONDS,
  toTime?: number
): Money | undefined {
  const { currency } = useCurrencyPref();
  const volume = useVolumeForPool(pool, fromTime, toTime);
  const convergentCurvePoolVolume = useFeeVolumeForConvergentCurvePool(
    pool,
    fromTime,
    toTime
  );
  const swapFee = useSwapFee(pool);

  if (isWeightedPool(pool) && volume && swapFee) {
    const fees = volume?.toDecimal() * +formatEther(swapFee);
    return Money.fromDecimal(fees, currency, Math.round);
  }

  if (isConvergentCurvePool(pool) && volume && swapFee) {
    return convergentCurvePoolVolume;
  }
}

function useFeeVolumeForConvergentCurvePool(
  pool: PoolContract | undefined,
  fromTime: number,
  toTime?: number
): Money | undefined {
  const { currency } = useCurrencyPref();
  const { data: poolId } = useSmartContractReadCall(pool, "getPoolId");
  const baseAssetContract = useBaseAssetForPool(pool);
  const [baseAssetDecimals] = useTokenDecimals(baseAssetContract);
  const poolTokensResult = usePoolTokens(pool);
  const balancerVault = useBalancerVault();
  const { data: fromBlockNumber } = usePreviousBlockNumber(fromTime);
  const { data: toBlockNumber } = usePreviousBlockNumber(toTime);
  const [baseAssetFiatPrice] = useTokenPrice(baseAssetContract, currency);
  const spotPrice = usePoolSpotPrice(pool, baseAssetContract);

  const { data: changeEvents = [] } = useQuery({
    queryKey: [
      ["balancerVault", "queryFilter", "PoolBalanceChanged"],
      { poolId, fromBlockNumber, toBlockNumber },
    ],
    queryFn: async () => {
      if (!balancerVault || !poolId) {
        return;
      }

      const filterQuery = balancerVault.filters.PoolBalanceChanged(
        poolId,
        null,
        null,
        null,
        null
      );

      const events = await balancerVault.queryFilter(
        filterQuery,
        fromBlockNumber,
        toBlockNumber
      );
      return events;
    },
    enabled:
      !!balancerVault &&
      !!poolId &&
      !!fromBlockNumber &&
      isConvergentCurvePool(pool),
  });

  const tokens = getQueryData(poolTokensResult)?.[0];

  if (
    !tokens ||
    !changeEvents ||
    !baseAssetContract ||
    !spotPrice ||
    !baseAssetFiatPrice
  ) {
    return undefined;
  }

  const baseAssetIndex = tokens.findIndex(
    (address) => address === baseAssetContract?.address
  );
  const yieldAssetIndex = baseAssetIndex ? 0 : 1;

  const totalFeesPerToken = [BigNumber.from(0), BigNumber.from(0)];

  changeEvents.forEach((event) => {
    const changeEvent = event?.args as PoolBalanceChangedArguments;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, __, assets, amounts, dueProtocolFeeAmounts] = changeEvent;
    totalFeesPerToken[0] = totalFeesPerToken[0].add(dueProtocolFeeAmounts[0]);
    totalFeesPerToken[1] = totalFeesPerToken[1].add(dueProtocolFeeAmounts[1]);
  });

  const baseAssetFees = +formatUnits(
    totalFeesPerToken[baseAssetIndex],
    baseAssetDecimals
  );
  const yieldAssetFees = +formatUnits(
    totalFeesPerToken[yieldAssetIndex],
    baseAssetDecimals
  );

  const totalFees = baseAssetFiatPrice.multiply(
    baseAssetFees + yieldAssetFees / spotPrice,
    Math.round
  );

  return totalFees;
}

type PoolBalanceChangedArguments = [
  poolId: string,
  sender: string,
  assets: string[],
  amounts: BigNumber[],
  dueProtocolFeeAmounts: BigNumber[]
];
