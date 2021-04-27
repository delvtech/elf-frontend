import { ERC20__factory } from "elf-contracts/types/factories/ERC20__factory";

import { KNOWN_BASE_ASSETS } from "efi/contracts/contractsJson";
import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";
import { ERC20 } from "elf-contracts/types/ERC20";

interface ParsedTokens {
  baseAssetContract: ERC20 | undefined;
  baseAssetIndex: number;
  termAssetContract: ERC20 | undefined;
  termAssetIndex: number;
}
// tokens and token related values are returned as arrrays that are sorted alphanumerically by token
// addresses.  this returns the index of the 'base asset' and 'yield asset' values of those arrays.
export function parseSortedTokensForPool(
  tokens: string[] | undefined
): ParsedTokens {
  const baseAssetIndex: number =
    tokens?.findIndex((address) => KNOWN_BASE_ASSETS.includes(address)) ?? 0;
  const termAssetIndex = baseAssetIndex === 0 ? 1 : 0;

  const baseAssetAddress = tokens?.[baseAssetIndex];
  const termAssetAddress = tokens?.[termAssetIndex];

  const baseAssetContract = baseAssetAddress
    ? ERC20__factory.connect(baseAssetAddress, jsonRpcProvider)
    : undefined;

  const termAssetContract = termAssetAddress
    ? ERC20__factory.connect(termAssetAddress, jsonRpcProvider)
    : undefined;

  return {
    baseAssetContract,
    baseAssetIndex,
    termAssetContract,
    termAssetIndex,
  };
}
