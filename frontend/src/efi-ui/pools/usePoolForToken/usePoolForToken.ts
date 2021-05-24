import { ERC20 } from "elf-contracts/types/ERC20";

import { principalPoolContracts, principalPools } from "efi/pools/ccpool";
import { PoolContract } from "efi/pools/PoolContract";
import { yieldPoolContracts, yieldPools } from "efi/pools/weightedPool";

/**
 * @deprecated hooks based lookups for pools are deprecated. use a getter instead
 */
export function usePoolForToken(
  tokenContract: ERC20 | undefined
): PoolContract | undefined {
  const tokenAddress = tokenContract?.address;

  if (!tokenAddress) {
    return undefined;
  }

  const principalPool = principalPools.find(
    (info) =>
      tokenAddress === info.extensions.bond ||
      tokenAddress === info.extensions.underlying
  );
  if (principalPool) {
    return principalPoolContracts.find(
      (contract) => contract.address === principalPool.address
    );
  }

  const yieldPool = yieldPools.find(
    (info) =>
      tokenAddress === info.extensions.interestToken ||
      tokenAddress === info.extensions.underlying
  );

  if (yieldPool) {
    return yieldPoolContracts.find(
      (contract) => contract.address === yieldPool.address
    );
  }
}
