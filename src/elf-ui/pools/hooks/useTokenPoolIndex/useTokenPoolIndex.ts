import { ERC20 } from "elf-contracts-typechain/dist/types/ERC20";

import { usePoolTokens } from "elf-ui/pools/hooks/usePoolTokens/usePoolTokens";
import { PoolContract } from "elf/pools/PoolContract";

export function useTokenPoolIndex(
  pool: PoolContract | undefined,
  tokenContract: ERC20 | undefined
): number | undefined {
  const { data: [tokens] = [] } = usePoolTokens(pool);
  const index = tokens?.findIndex((token) => token === tokenContract?.address);

  return index;
}
