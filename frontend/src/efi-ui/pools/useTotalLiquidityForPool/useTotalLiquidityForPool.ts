import { ERC20__factory } from "elf-contracts/types/factories/ERC20__factory";
import { BigNumber } from "ethers";
import zip from "lodash.zip";
import zipObject from "lodash.zipobject";
import { Money } from "ts-money";

import { getQueriesData } from "efi-ui/base/queryResults";
import { useConvertToFiat } from "efi-ui/money/hooks/useConvertToFiat";
import { usePoolSpotPrice } from "efi-ui/pools/usePoolSpotPrice/usePoolSpotPrice";
import { usePoolTokenPricesMulti } from "efi-ui/pools/usePoolTokenPrices/usePoolTokenPrices";
import { usePoolTokens } from "efi-ui/pools/usePoolTokens/usePoolTokens";
import { usePoolTokensMulti } from "efi-ui/pools/usePoolTokens/usePoolTokensMulti";
import { useCurrencyPref } from "efi-ui/prefs/useCurrency/useCurencyPref";
import { useTokenDecimals } from "efi-ui/token/hooks/useTokenDecimals";
import { useTokenDecimalsMulti } from "efi-ui/token/hooks/useTokenDecimalsMulti";
import {
  useTokenPrice,
  useTokenPriceMulti,
} from "efi-ui/token/hooks/useTokenPrice";
import { KNOWN_BASE_ASSETS } from "efi/addresses";
import { convertToFiatBalance } from "efi/money/convertToFiatBalance";
import { PoolContract } from "efi/pools/PoolContract";
import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";
import { useSmartContractFromFactoryMulti } from "efi-ui/contracts/useSmartContractFromFactory/useSmartContractFromFactory";

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

export function useTotalLiquidityForPoolMulti(
  pools: (PoolContract | undefined)[]
): (Money | undefined)[] {
  const { currency } = useCurrencyPref();
  // get the tokens for each pool and create lookup objects for their balances
  const poolTokensMultiResult = usePoolTokensMulti(pools);
  const poolTokensMulti: [string[], BigNumber[], BigNumber][] = getQueriesData(
    poolTokensMultiResult
  ).filter((v): v is [string[], BigNumber[], BigNumber] => !!v);
  const balancesByTokenMulti = poolTokensMulti.map(([addresses, balances]) =>
    zipObject(addresses, balances)
  );

  // Get the base asset contract, and its fiat price from coingecko
  const baseAssetAddresses = poolTokensMulti.map(([tokenAddresses]) =>
    tokenAddresses.find((address) => KNOWN_BASE_ASSETS.includes(address))
  );
  const baseAssetContracts = useSmartContractFromFactoryMulti(
    baseAssetAddresses,
    ERC20__factory.connect
  );
  const baseAssetFiatPriceResults = useTokenPriceMulti(
    baseAssetContracts,
    currency
  );
  const baseAssetDecimalResults = useTokenDecimalsMulti(baseAssetContracts);
  const baseAssetFiatPrices = getQueriesData(baseAssetFiatPriceResults);
  const baseAssetDecimals = getQueriesData(baseAssetDecimalResults);
  const baseAssetFiatBalances = zip(
    baseAssetFiatPrices,
    balancesByTokenMulti,
    baseAssetAddresses,
    baseAssetDecimals
  ).map(([fiatPrice, balancesByToken, baseAssetAddress, decimals]) => {
    if (!balancesByToken || !baseAssetAddress || !fiatPrice || !decimals) {
      return undefined;
    }
    const balance = balancesByToken[baseAssetAddress];
    return convertToFiatBalance(fiatPrice, balance, decimals);
  });

  // Get the other asset (PT or YT), and its fiat price by getting the spot
  // price against the base asset, then looking that up in coingecko
  const ptOrYtAddress = poolTokensMulti.map(([tokenAddresses]) =>
    tokenAddresses.find((address) => !KNOWN_BASE_ASSETS.includes(address))
  );
  const ptOrYtToken = useSmartContractFromFactoryMulti(
    ptOrYtAddress,
    ERC20__factory.connect
  );
  const ptOrYtDecimalsResult = useTokenDecimalsMulti(ptOrYtToken);
  const ptOrYtDecimals = getQueriesData(ptOrYtDecimalsResult);
  const spotPrices = usePoolTokenPricesMulti(pools, baseAssetContracts);

  const ptOrYtFiatBalances = zip(
    balancesByTokenMulti,
    baseAssetFiatPrices,
    spotPrices,
    ptOrYtAddress,
    ptOrYtDecimals
  ).map(([balancesByToken, fiatPrice, spotPrice, ptOrYtAddress, decimals]) => {
    if (
      !balancesByToken ||
      !ptOrYtAddress ||
      !spotPrice?.spotPriceBaseAssetForOneToken ||
      !decimals
    ) {
      return undefined;
    }

    const balance = balancesByToken[ptOrYtAddress];

    const yieldAssetPrice = Money.fromDecimal(
      spotPrice.spotPriceBaseAssetForOneToken * (fiatPrice?.toDecimal() || 1),
      currency,
      Math.round
    );

    const ptOrYtFiatBalance = convertToFiatBalance(
      yieldAssetPrice,
      balance,
      decimals
    );

    return ptOrYtFiatBalance || Money.fromInteger(0, currency.code);
  });

  const totalLiquidityForPoolMulti = zip(
    baseAssetFiatBalances,
    ptOrYtFiatBalances
  ).map(([baseFiatBalance, ptOrYtFiatBalance]) => {
    if (!baseFiatBalance || !ptOrYtFiatBalance) {
      return undefined;
    }
    return baseFiatBalance.add(ptOrYtFiatBalance);
  });

  return totalLiquidityForPoolMulti;
}
