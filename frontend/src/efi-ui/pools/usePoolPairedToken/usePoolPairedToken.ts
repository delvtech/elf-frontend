import { ERC20 } from "elf-contracts/types/ERC20";
import { getQueryData } from "efi-ui/base/queryResults";
import { useSmartContractFromFactory } from "efi-ui/contracts/useSmartContractFromFactory/useSmartContractFromFactory";
import { ERC20__factory } from "elf-contracts/types";
import { PoolContract } from "efi/pools/PoolContract";
import { usePoolTokens } from "efi-ui/pools/usePoolTokens/usePoolTokens";

export function usePoolPairedToken(
  pool: PoolContract | undefined,
  poolToken: ERC20 | undefined
): ERC20 | undefined {
  const poolTokensResult = usePoolTokens(pool);

  // Get the other token's address
  const [tokens] = getQueryData(poolTokensResult) || [];
  const pairedTokenAddress = tokens?.find(
    (address) => address !== poolToken?.address
  );

  const pairedToken = useSmartContractFromFactory(
    pairedTokenAddress,
    ERC20__factory.connect
  );

  return pairedToken;
}
