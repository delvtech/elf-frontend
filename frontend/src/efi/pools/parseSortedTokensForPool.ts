import { KNOWN_BASE_ASSETS } from "efi/addresses";
import { UnderlyingContracts } from "efi/underlying/underlying";
import { trancheContractsByAddress } from "efi/tranche/tranches";
import { InterestTokenContractsByAddress } from "efi/interestToken/interestToken";
import { USDC } from "elf-contracts/types/USDC";
import { WETH } from "elf-contracts/types/WETH";
import { InterestToken } from "elf-contracts/types/InterestToken";
import { Tranche } from "elf-contracts/types/Tranche";

interface ParsedTokens {
  baseAssetContract: WETH | USDC | undefined;
  baseAssetIndex: number;
  termAssetContract: InterestToken | Tranche | undefined;
  termAssetIndex: number;
}

// tokens and token related values are returned as arrrays that are sorted alphanumerically by token
// addresses.  this returns the index of the 'base asset' and 'yield asset' values of those arrays.
export function useParseSortedTokensForPool(
  tokens: string[] | undefined
): ParsedTokens {
  const baseAssetIndex: number =
    tokens?.findIndex((address) => KNOWN_BASE_ASSETS.includes(address)) ?? 0;
  const termAssetIndex = baseAssetIndex === 0 ? 1 : 0;

  const baseAssetAddress = tokens?.[baseAssetIndex];
  const termAssetAddress = tokens?.[termAssetIndex];

  const baseAssetContract = baseAssetAddress
    ? UnderlyingContracts[baseAssetAddress]
    : undefined;

  const termAssetContract = termAssetAddress
    ? trancheContractsByAddress[termAssetAddress] ||
      InterestTokenContractsByAddress[termAssetAddress]
    : undefined;

  return {
    baseAssetContract,
    baseAssetIndex,
    termAssetContract,
    termAssetIndex,
  };
}
