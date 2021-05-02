import { ERC20 } from "elf-contracts/types/ERC20";
import { useCurrencyPref } from "efi-ui/prefs/useCurrency/useCurencyPref";
import { useTokenDecimals } from "efi-ui/token/hooks/useTokenDecimals";
import { useTokenPrice } from "efi-ui/token/hooks/useTokenPrice";
import { convertToFiatBalance } from "efi/money/convertToFiatBalance";
import { PoolContract } from "efi/pools/PoolContract";
import { useAccumulatedInterestForTranche } from "./useAccumulatedInterestForTranche";
import { Money } from "ts-money";

export function useAccumulatedFiatInterestForTranche(
  baseAssetContract: ERC20 | undefined,
  pool: PoolContract | undefined
): Money | undefined {
  const { currency } = useCurrencyPref();
  const [baseAssetPrice] = useTokenPrice(baseAssetContract, currency);
  const { data: baseAssetDecimals } = useTokenDecimals(baseAssetContract);
  const accumulatedInterest = useAccumulatedInterestForTranche(pool);

  let accumulatedInterestFiat;
  if (baseAssetPrice && baseAssetDecimals && accumulatedInterest) {
    accumulatedInterestFiat = convertToFiatBalance(
      baseAssetPrice,
      accumulatedInterest,
      baseAssetDecimals
    );
  }

  return accumulatedInterestFiat;
}
