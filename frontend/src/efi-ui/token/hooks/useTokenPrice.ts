import { QueryObserverResult } from "react-query";

import { CurveContract__factory } from "elf-contracts/types";
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
import { ChainId, isMainnet, ONE_ETHER } from "efi/ethereum";
import { defaultProvider } from "efi/providers/providers";
import { getTokenInfo } from "efi/tokenlists";

export function useTokenPrice<TContract extends ERC20>(
  contract: TContract,
  currency: Currency
): QueryObserverResult<Money> {
  const { symbol: tokenSymbol, decimals } = getTokenInfo(contract.address);

  // try and get the price from coingecko
  const priceResult = useCoinGeckoPrice(getCoinGeckoId(tokenSymbol), currency);

  // otherwise see if it's the mainnet crvlusd or crvALUSD pool
  const isCrvlusd = contract.address === AddressesJson.addresses.crvlusdAddress;

  const isCrvalusd =
    contract.address === AddressesJson.addresses.crvalusdAddress;

  const isCrvTricrypto =
    contract.address === AddressesJson.addresses.crvtricryptoAddress;
  const isCurve = isCrvalusd || isCrvlusd;

  const virtualPriceResult = useSmartContractReadCall(
    isMainnet(AddressesJson.chainId) && isCurve
      ? CRVLUSD__factory.connect(contract.address, defaultProvider)
      : (contract as unknown as CRVLUSD),
    "get_virtual_price",
    // this is a hack so we disable this if the contract isn't specifically crvlusd
    {
      callArgs: [],
      enabled: isCurve,
    }
  );

  const triCryptoPrice = useTriCryptoPrice(isCrvTricrypto);

  // on goerli, we'll just hard-code crvtricrypto to $1500, since there is
  // no goerli curve pools available
  if (isCrvTricrypto && AddressesJson.chainId === ChainId.GOERLI) {
    return {
      data: Money.fromDecimal(1500, currency, Math.round),
    } as QueryObserverResult<Money>;
  }

  // on goerli, we'll just hard-code crvlusd and crvalusd to 1, since there is
  // no goerli curve pools available
  if (isCurve && AddressesJson.chainId === ChainId.GOERLI) {
    // return a fake query observer result, which sucks but yoloswag5000 for goerli testnet
    return {
      data: Money.fromDecimal(1, currency, Math.round),
    } as QueryObserverResult<Money>;
  }

  if (isCrvTricrypto) {
    return {
      data: Money.fromDecimal(triCryptoPrice ?? 0, currency, Math.round),
    } as QueryObserverResult<Money>;
  }

  // otherwise if we're on mainnet and it's a crv token, return it's virtual price
  if (isCurve) {
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

  // if it's not a crv token, return the coingecko price
  return priceResult;
}

const CRVTriCrytoPoolAddress = "0x80466c64868e1ab14a1ddf27a676c3fcbe638fe5";
function useTriCryptoPrice(enabled: boolean) {
  const { currency } = useCurrencyPref();
  const CrvPool = CurveContract__factory.connect(
    CRVTriCrytoPoolAddress,
    defaultProvider
  );
  const triCryptoUSDTPriceResult = useSmartContractReadCall(
    CrvPool,
    "calc_withdraw_one_coin",
    {
      callArgs: [ONE_ETHER, BigNumber.from(0)],
      enabled: isMainnet(AddressesJson.chainId) && enabled,
    }
  );
  const usdtPriceResult = useCoinGeckoPrice(getCoinGeckoId("usdt"), currency);
  const { data: triCryptoPriceInUSDT } = triCryptoUSDTPriceResult;
  const { data: usdtPrice } = usdtPriceResult;

  if (triCryptoPriceInUSDT && usdtPrice) {
    const triCryptoPrice =
      +formatUnits(triCryptoPriceInUSDT, 6) / +usdtPrice.toString();
    return triCryptoPrice;
  }
}
