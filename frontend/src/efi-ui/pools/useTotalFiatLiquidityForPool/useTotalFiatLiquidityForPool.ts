import { useMemo } from "react";

import { ERC20__factory } from "elf-contracts/types/factories/ERC20__factory";
import { BigNumber } from "ethers";
import { Money } from "ts-money";

import { useConvertToFiat } from "efi-ui/money/hooks/useConvertToFiat";
import { usePoolSpotPrice } from "efi-ui/pools/usePoolSpotPrice/usePoolSpotPrice";
import { usePoolTokens } from "efi-ui/pools/usePoolTokens/usePoolTokens";
import { useCurrencyPref } from "efi-ui/prefs/useCurrency/useCurencyPref";
import { useTokenDecimals } from "efi-ui/token/hooks/useTokenDecimals";
import { useTokenPrice } from "efi-ui/token/hooks/useTokenPrice";
import { KNOWN_BASE_ASSETS } from "efi/addresses";
import { convertToFiatBalance } from "efi/money/convertToFiatBalance";
import { PoolContract } from "efi/pools/PoolContract";
import { defaultProvider } from "efi/providers/providers";

export function useTotalFiatLiquidityForPool(
  pool: PoolContract | undefined
): Money | undefined {
  const { currency } = useCurrencyPref();
  const { data: [tokens, balances] = [undefined, undefined] } =
    usePoolTokens(pool);

  const baseAssetIndex: number =
    tokens?.findIndex((address) => KNOWN_BASE_ASSETS.includes(address)) ?? 0;
  const baseAssetAddress = tokens?.[baseAssetIndex];
  const baseAssetBalance = balances?.[baseAssetIndex];

  const baseAssetContract = baseAssetAddress
    ? ERC20__factory.connect(baseAssetAddress, defaultProvider)
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
    ? ERC20__factory.connect(yieldAssetAddress, defaultProvider)
    : undefined;
  const { data: yieldAssetDecimals } = useTokenDecimals(yieldAssetContract);

  const spotPrice = usePoolSpotPrice(pool, baseAssetContract);

  const yieldAssetPrice = Money.fromDecimal(
    (baseAssetPrice?.toDecimal() || 1) / (spotPrice || 1),
    currency,
    Math.round
  );

  const yieldAssetFiatBalance =
    convertToFiatBalance(
      yieldAssetPrice,
      yieldAssetBalance ?? BigNumber.from(0),
      yieldAssetDecimals ?? 18
    ) || Money.fromDecimal(0, currency.code, Math.round);

  const totalBalance = baseAssetFiatBalance?.add(yieldAssetFiatBalance);

  const totalBalanceString = totalBalance?.toString();
  const totalLiquidity = useMemo(
    () => totalBalance,
    // hack to memoize the Money object by looking at its converted string value
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [totalBalanceString]
  );

  if (
    spotPrice === undefined ||
    yieldAssetBalance === undefined ||
    yieldAssetDecimals === undefined
  ) {
    // if there is no yield assets in the pool, then we just show the base fiat balance
    return baseAssetFiatBalance;
  }

  return totalLiquidity;
}
