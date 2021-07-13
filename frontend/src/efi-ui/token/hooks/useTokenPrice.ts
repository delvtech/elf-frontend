import { QueryObserverResult } from "react-query";

import { CRVLUSD } from "elf-contracts/types/CRVLUSD";
import { ERC20 } from "elf-contracts/types/ERC20";
import { CRVLUSD__factory } from "elf-contracts/types/factories/CRVLUSD__factory";
import { BigNumber } from "ethers";
import { formatUnits } from "ethers/lib/utils";
import { Currency, Money } from "ts-money";

import { getCoinGeckoId } from "efi-coingecko";
import { useCoinGeckoPrice } from "efi-ui/coingecko/useCoinGeckoPrice";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { useCurrencyPref } from "efi-ui/prefs/useCurrency/useCurencyPref";
import { AddressesJson } from "efi/addresses";
import { formatBalance } from "efi/base/formatBalance";
import { isGoerli, isMainnet, NUM_ETH_DECIMALS, ONE_ETHER } from "efi/ethereum";
import { defaultProvider } from "efi/providers/providers";
import { getTokenInfo } from "efi/tokenlists";
import { crvTriCryptoPoolContract, steCrvPoolContract } from "efi-curve/pools";

export function useTokenPrice<TContract extends ERC20>(
  contract: TContract,
  currency: Currency
): QueryObserverResult<Money> {
  const { symbol: tokenSymbol, decimals } = getTokenInfo(contract.address);

  // try and get the price from coingecko
  const priceResult = useCoinGeckoPrice(getCoinGeckoId(tokenSymbol), currency);

  // Curve stable pools have a `get_virtual_price` method, since they're all
  // pegged assets
  const isCrvlusd = contract.address === AddressesJson.addresses.crvlusdAddress;
  const isCrvalusd =
    contract.address === AddressesJson.addresses.crvalusdAddress;
  const isCurveVirtualPriceCompatible = isCrvalusd || isCrvlusd;
  const virtualPriceResult = useSmartContractReadCall(
    isMainnet(AddressesJson.chainId) && isCurveVirtualPriceCompatible
      ? CRVLUSD__factory.connect(contract.address, defaultProvider)
      : (contract as unknown as CRVLUSD),
    "get_virtual_price",
    // this is a hack so we disable this if the contract isn't specifically crvlusd
    {
      callArgs: [],
      enabled: isCurveVirtualPriceCompatible,
    }
  );

  // Curve pools that are more complicated, and need custom pricing logic
  const isCrvTricrypto =
    contract.address === AddressesJson.addresses.crvtricryptoAddress;
  const triCryptoPrice = useTriCryptoPrice({ enabled: isCrvTricrypto });

  const isSteCrv = contract.address === AddressesJson.addresses.stecrvAddress;
  const steCrvPrice = useSteCrvPrice({ enabled: isSteCrv });

  // NOTE: Goerli - there are no curve assets on goerli, so this is our best
  // effort guess at some prices for things.

  // Goerli curve stable pools can be inferred to be $1
  if (isGoerli(AddressesJson.chainId) && isCurveVirtualPriceCompatible) {
    return {
      data: Money.fromDecimal(1, currency, Math.round),
    } as QueryObserverResult<Money>;
  }

  // What's the price of eth on goerli? $1500, Bob! Admittedly, this could be
  // the price of mainnet eth, but we'd have to write that goerli-only hook...
  if (isGoerli(AddressesJson.chainId) && (isCrvTricrypto || isSteCrv)) {
    return {
      data: Money.fromDecimal(1500, currency, Math.round),
    } as QueryObserverResult<Money>;
  }

  // Mainnet
  if (isCurveVirtualPriceCompatible) {
    const priceString = formatBalance(virtualPriceResult.data, decimals);
    const price = Money.fromDecimal(
      +priceString,
      currency,
      // Money.fromDecimal will throw if price has more decimals than the currency
      // allows unless you pass a rounding function
      Math.round
    );

    return {
      ...virtualPriceResult,
      data: price,
    } as QueryObserverResult<Money>;
  }

  if (isCrvTricrypto) {
    return {
      data: Money.fromDecimal(triCryptoPrice ?? 0, currency, Math.round),
    } as QueryObserverResult<Money>;
  }

  if (isSteCrv) {
    return {
      data: Money.fromDecimal(steCrvPrice ?? 0, currency, Math.round),
    } as QueryObserverResult<Money>;
  }

  // if it's not a crv token, return the coingecko price
  return priceResult;
}

interface HookPriceOptions {
  enabled: boolean;
}

function useTriCryptoPrice({ enabled }: HookPriceOptions) {
  const { currency } = useCurrencyPref();
  // tricrypto is made up of usdt, eth, and wbtc so we get a price in usdt
  const { data: triCryptoPriceInUSDT } = useSmartContractReadCall(
    crvTriCryptoPoolContract,
    "calc_withdraw_one_coin",
    {
      callArgs: [ONE_ETHER, BigNumber.from(0)],
      enabled: isMainnet(AddressesJson.chainId) && enabled,
    }
  );
  const { data: usdtPrice } = useCoinGeckoPrice(
    getCoinGeckoId("usdt"),
    currency
  );

  if (triCryptoPriceInUSDT && usdtPrice) {
    const triCryptoPrice =
      +formatUnits(triCryptoPriceInUSDT, 6) / +usdtPrice.toString();
    return triCryptoPrice;
  }
}

function useSteCrvPrice({ enabled }: { enabled: boolean }) {
  const { currency } = useCurrencyPref();
  // steCRV is made up of eth and stEth, so we get a price in eth
  const { data: steCrvPriceInEth } = useSmartContractReadCall(
    steCrvPoolContract,
    "calc_withdraw_one_coin",
    {
      callArgs: [ONE_ETHER, 0],
      enabled: isMainnet(AddressesJson.chainId) && enabled,
    }
  );

  // price of eth in pennies
  const { data: ethPrice } = useCoinGeckoPrice(getCoinGeckoId("eth"), currency);

  if (steCrvPriceInEth && ethPrice) {
    const steCrvPrice =
      +formatUnits(steCrvPriceInEth, NUM_ETH_DECIMALS) * +ethPrice.toString();
    return steCrvPrice;
  }
}
