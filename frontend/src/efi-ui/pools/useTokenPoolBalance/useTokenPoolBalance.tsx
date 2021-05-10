import { ERC20 } from "elf-contracts/types/ERC20";
import { BigNumber } from "ethers";

import { usePoolTokens } from "efi-ui/pools/usePoolTokens/usePoolTokens";
import { PoolContract } from "efi/pools/PoolContract";

export function useTokenPoolBalance(
  pool: PoolContract | undefined,
  tokenContract: ERC20 | undefined
): BigNumber | undefined {
  const { data: [tokens, balances] = [] } = usePoolTokens(pool);
  const index =
    tokens?.findIndex((token) => token === tokenContract?.address) ?? -1;

  const poolBalance = balances?.[index];
  return poolBalance;
}
