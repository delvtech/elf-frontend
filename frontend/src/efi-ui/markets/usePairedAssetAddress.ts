import { BPool } from "elf-contracts/types/BPool";

import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";

/**
 * Returns the paired asset's contract address for a given market.
 *
 * Example:
 *
 * const pairedAsset = usePairedAsset(fyEthToWethMarket, WETH_ADDRESS);
 * // Result: `pairedAsset` is the fyETH token address
 *
 */
export function usePairedAssetAddress(
  marketContract: BPool | undefined,
  baseAssetAddress: string | undefined
): string | undefined {
  const { data: finalTokens } = useSmartContractReadCall(
    marketContract,
    "getFinalTokens"
  );

  if (!finalTokens || !baseAssetAddress) {
    return;
  }

  const pairedAssetAddress = finalTokens.find(
    (address) => address !== baseAssetAddress
  );

  return pairedAssetAddress;
}
