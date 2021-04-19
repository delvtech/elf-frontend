import { ERC20__factory } from "elf-contracts/types/factories/ERC20__factory";
import { Money } from "ts-money";

import { useConvertToFiat } from "efi-ui/money/hooks/useConvertToFiat";
import { usePoolSpotPrice } from "efi-ui/pools/usePoolSpotPrice/usePoolSpotPrice";
import { usePoolTokens } from "efi-ui/pools/usePoolTokens/usePoolTokens";
import { useCurrencyPref } from "efi-ui/prefs/useCurrency/useCurencyPref";
import { useTokenDecimals } from "efi-ui/token/hooks/useTokenDecimals";
import { useTokenPrice } from "efi-ui/token/hooks/useTokenPrice";
import { KNOWN_BASE_ASSETS } from "efi/contracts/contractsJson";
import { PoolContract } from "efi/pools/PoolContract";
import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";
import { convertToFiatBalance } from "efi/money/convertToFiatBalance";

export function useTotalLiquidityForPool(
  pool: PoolContract | undefined
): Money | undefined {
  const { currency } = useCurrencyPref();
  const { data: [tokens, balances] = [undefined, undefined] } = usePoolTokens(
    pool
  );

  const baseAssetIndex: number =
    tokens?.findIndex((address) => KNOWN_BASE_ASSETS.includes(address)) ?? 0;
  const baseAssetAddress = tokens?.[baseAssetIndex];
  const baseAssetBalance = balances?.[baseAssetIndex];

  const baseAssetContract = baseAssetAddress
    ? ERC20__factory.connect(baseAssetAddress, jsonRpcProvider)
    : undefined;
  const [baseAssetPrice] = useTokenPrice(baseAssetContract, currency);
  const { data: baseAssetDecimals } = useTokenDecimals(baseAssetContract);

  // Base Asset Fiat Balance
  const baseAssetFiatBalance = useConvertToFiat(
    baseAssetPrice,
    baseAssetBalance,
    baseAssetDecimals
  );

  const yieldAssetIndex = baseAssetIndex === 0 ? 1 : 0;
  const yieldAssetAddress = tokens?.[yieldAssetIndex];
  const yieldAssetBalance = balances?.[yieldAssetIndex];
  const yieldAssetContract = yieldAssetAddress
    ? ERC20__factory.connect(yieldAssetAddress, jsonRpcProvider)
    : undefined;
  const { data: yieldAssetDecimals } = useTokenDecimals(yieldAssetContract);

  const spotPrice = usePoolSpotPrice(pool, baseAssetContract);

  if (
    spotPrice === undefined ||
    yieldAssetBalance === undefined ||
    yieldAssetDecimals === undefined
  ) {
    return undefined;
  }

  const yieldAssetPrice = Money.fromDecimal(
    spotPrice * (baseAssetPrice?.toDecimal() || 1),
    currency,
    Math.round
  );

  const yieldAssetFiatBalance =
    convertToFiatBalance(
      yieldAssetPrice,
      yieldAssetBalance,
      yieldAssetDecimals
    ) || Money.fromInteger(0, currency.code);

  const totalBalance = baseAssetFiatBalance?.add(yieldAssetFiatBalance);
  return totalBalance;
}
