import { usePoolTokens } from "efi-ui/pools/usePoolTokens/usePoolTokens";
import { PoolContract } from "efi/pools/PoolContract";
import { ERC20 } from "elf-contracts/types/ERC20";

export function useTokenPoolIndex(
  pool: PoolContract | undefined,
  tokenContract: ERC20 | undefined
): number | undefined {
  const { data: [tokens] = [] } = usePoolTokens(pool);
  const index = tokens?.findIndex((token) => token === tokenContract?.address);

  return index;
}
