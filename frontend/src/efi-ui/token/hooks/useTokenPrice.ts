import { QueryObserverResult } from "react-query";

import { ERC20 } from "elf-contracts-typechain/dist/types/ERC20";
import { Currency, Money } from "ts-money";

import { getCoinGeckoId } from "efi-coingecko";
import { useCoinGeckoPrice } from "efi-ui/coingecko/useCoinGeckoPrice";
import { AddressesJson } from "efi/addresses";
import { isMainnet } from "efi/ethereum";
import { getTokenInfo } from "efi/tokenlists";
import {
  curveVirtualPriceContractsByAddress,
  isCurveStablePool,
} from "efi-curve/stablePools";
import { useCurveStablecoinPoolVirtualPrice } from "efi-ui/curve/stablePools";
import {
  useCrv3CryptoPrice,
  useSteCrvPrice,
  useTriCryptoPrice,
} from "efi-ui/curve/pools";

const {
  chainId,
  addresses: { crvtricryptoAddress, crv3cryptoAddress, stecrvAddress },
} = AddressesJson;

export function useTokenPrice<TContract extends ERC20>(
  contract: TContract,
  currency: Currency
): QueryObserverResult<Money> {
  const { symbol: tokenSymbol, decimals } = getTokenInfo(contract.address);

  // Regular base assets
  const coinGeckoPriceResult = useCoinGeckoPrice(
    getCoinGeckoId(tokenSymbol), // query is disabled when this is undefined
    currency
  );

  // Curve stable pools, eg: crvLUSD
  const isStablePool = isCurveStablePool(contract.address);
  const curveStablePoolContract =
    isMainnet(chainId) && isStablePool
      ? curveVirtualPriceContractsByAddress[contract.address]
      : undefined;
  const curveStablePoolPriceResult = useCurveStablecoinPoolVirtualPrice(
    // query is disabled when this is undefined
    curveStablePoolContract,
    decimals
  );

  // Individual Curve non-stable pools, eg crvTricrypto or steCRV
  const isCrvTricrypto = contract.address === crvtricryptoAddress;
  const triCryptoPriceResult = useTriCryptoPrice({ enabled: isCrvTricrypto });
  const isCrv3crypto = contract.address === crv3cryptoAddress;
  const crv3CryptoPriceResult = useCrv3CryptoPrice({ enabled: isCrv3crypto });

  const isSteCrv = contract.address === stecrvAddress;
  const steCrvPriceResult = useSteCrvPrice({ enabled: isSteCrv });

  // Because of the nature of hooks, we must return the correct token price here at the end.
  if (isCurveStablePool(contract.address)) {
    return curveStablePoolPriceResult;
  }

  if (isCrv3crypto) {
    return crv3CryptoPriceResult;
  }

  if (isCrvTricrypto) {
    return triCryptoPriceResult;
  }

  if (isSteCrv) {
    return steCrvPriceResult;
  }

  return coinGeckoPriceResult;
}
