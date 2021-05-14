import { ERC20__factory } from "elf-contracts/types/factories/ERC20__factory";

import { KNOWN_BASE_ASSETS } from "efi/addresses";
import { ERC20 } from "elf-contracts/types/ERC20";
import { getSmartContractFromRegistry } from "efi/contracts/SmartContractsRegistry";

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

  const baseAssetContract = getSmartContractFromRegistry(
    baseAssetAddress,
    ERC20__factory.connect
  );

  const termAssetContract = getSmartContractFromRegistry(
    termAssetAddress,
    ERC20__factory.connect
  );

  return {
    baseAssetContract,
    baseAssetIndex,
    termAssetContract,
    termAssetIndex,
  };
}
