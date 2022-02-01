import { ERC20 } from "@elementfi/core-typechain";
import { usePoolTokens } from "efi-ui/pools/hooks/usePoolTokens/usePoolTokens";
import { PoolContract } from "efi/pools/PoolContract";
import { BigNumber } from "ethers";

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
