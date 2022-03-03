import { useCallback } from "react";
import { QueryObserverResult } from "react-query";

import { BigNumber } from "ethers";
import { formatUnits } from "ethers/lib/utils";
import { Currencies, Money } from "ts-money";

import { getCoinGeckoId } from "integrations/efi-coingecko";
import {
  crv3CryptoPoolContract,
  crvTriCryptoPoolContract,
  steCrvPoolContract,
} from "integrations/efi-curve/pools";
import { useCoinGeckoPrice } from "efi-ui/coingecko/useCoinGeckoPrice";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { useCurrencyPref } from "efi-ui/prefs/useCurrency/useCurencyPref";
import { AddressesJson } from "addresses/addresses";
import { ONE_MINUTE_IN_MILLISECONDS } from "base/time";
import {
  isGoerli,
  isMainnet,
  NUM_ETH_DECIMALS,
  ONE_ETHER,
} from "efi/ethereum/ethereum";

interface HookPriceOptions {
  enabled: boolean;
}

const GOERLI_STUB_PRICE = {
  data: new Money(150000, Currencies.USD),
} as QueryObserverResult<Money>;

export function useCrv3CryptoPrice({
  enabled,
}: HookPriceOptions): QueryObserverResult<Money> {
  const { currency } = useCurrencyPref();

  // tricrypto is made up of usdt, eth, and wbtc so we get a price in usdt
  const { data: usdtPrice } = useCoinGeckoPrice(
    getCoinGeckoId("usdt"),
    currency
  );

  const calcWithdrawOneCoinResult = useSmartContractReadCall(
    crv3CryptoPoolContract,
    "calc_withdraw_one_coin",
    {
      callArgs: [ONE_ETHER, 0],
      enabled: !!usdtPrice && isMainnet(AddressesJson.chainId) && enabled,
      staleTime: ONE_MINUTE_IN_MILLISECONDS,
      select: useCallback(
        (triCryptoPriceInUSDT: BigNumber) => {
          const price =
            +formatUnits(triCryptoPriceInUSDT, 6) /
            +(usdtPrice as Money).toString();
          return Money.fromDecimal(price, currency, Math.round);
        },
        [currency, usdtPrice]
      ),
    }
  );

  if (isGoerli(AddressesJson.chainId)) {
    return GOERLI_STUB_PRICE;
  }

  return calcWithdrawOneCoinResult;
}
export function useTriCryptoPrice({
  enabled,
}: HookPriceOptions): QueryObserverResult<Money> {
  const { currency } = useCurrencyPref();

  // tricrypto is made up of usdt, eth, and wbtc so we get a price in usdt
  const { data: usdtPrice } = useCoinGeckoPrice(
    getCoinGeckoId("usdt"),
    currency
  );

  const calcWithdrawOneCoinResult = useSmartContractReadCall(
    crvTriCryptoPoolContract,
    "calc_withdraw_one_coin",
    {
      callArgs: [ONE_ETHER, 0],
      enabled: !!usdtPrice && isMainnet(AddressesJson.chainId) && enabled,
      staleTime: ONE_MINUTE_IN_MILLISECONDS,
      select: useCallback(
        (triCryptoPriceInUSDT: BigNumber) => {
          const price =
            +formatUnits(triCryptoPriceInUSDT, 6) /
            +(usdtPrice as Money).toString();
          return Money.fromDecimal(price, currency, Math.round);
        },
        [currency, usdtPrice]
      ),
    }
  );

  if (isGoerli(AddressesJson.chainId)) {
    return GOERLI_STUB_PRICE;
  }

  return calcWithdrawOneCoinResult;
}

export function useSteCrvPrice({
  enabled,
}: HookPriceOptions): QueryObserverResult<Money> {
  const { currency } = useCurrencyPref();
  // steCRV is made up of eth and stEth, so we get a price in eth
  const { data: ethPrice } = useCoinGeckoPrice(getCoinGeckoId("eth"), currency);

  const calcWithdrawOneCoinResult = useSmartContractReadCall(
    steCrvPoolContract,
    "calc_withdraw_one_coin",
    {
      callArgs: [ONE_ETHER, 0],
      staleTime: ONE_MINUTE_IN_MILLISECONDS,
      enabled: !!ethPrice && isMainnet(AddressesJson.chainId) && enabled,
      select: useCallback(
        (steCrvPriceInEth: BigNumber) => {
          const price =
            +formatUnits(steCrvPriceInEth, NUM_ETH_DECIMALS) *
            +(ethPrice as Money).toString();
          return Money.fromDecimal(price, currency.code, Math.round);
        },
        [currency.code, ethPrice]
      ),
    }
  );

  if (isGoerli(AddressesJson.chainId)) {
    return GOERLI_STUB_PRICE;
  }

  return calcWithdrawOneCoinResult;
}
