import { BPool } from "elf-contracts/types/BPool";

import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { useMarketContract } from "efi-ui/markets/useMarketContract";
import { ContractMethodArgs } from "efi/contracts/types";
import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";

import { usePairedAssetAddress } from "./usePairedAssetAddress";

/**
 * Returns the price of the paired asset in terms of it's base asset. Useful
 * for both FYT and YC balancer pool markets.
 *
 * Example:
 *
 * const priceInWeth = usePairedAssetPrice(FYETH_TO_WETH_MARKET_ADDRESS, WETH_ADDRESS);
 * // Result:  0.983222232
 */
export function usePairedAssetPrice(
  bPoolAddress: string | undefined,
  baseAssetAddress: string | undefined
) {
  const marketContract = useMarketContract(bPoolAddress, jsonRpcProvider);

  const pairedAssetAddress = usePairedAssetAddress(
    marketContract,
    baseAssetAddress
  );

  const spotPriceCallArgs = getSpotPriceCallArgs(
    baseAssetAddress,
    pairedAssetAddress
  );

  const price = useSmartContractReadCall(marketContract, "getSpotPrice", {
    callArgs: spotPriceCallArgs,
  });

  return price;
}

function getSpotPriceCallArgs(
  baseAssetAddress: string | undefined,
  pairedAssetAddress: string | undefined
): ContractMethodArgs<BPool, "getSpotPrice"> | undefined {
  if (!baseAssetAddress || !pairedAssetAddress) {
    return undefined;
  }

  return [pairedAssetAddress, baseAssetAddress];
}
