import { BigNumber } from "ethers";
import zip from "lodash.zip";

import { useTokensWithBalance } from "efi-ui/token/hooks/useTokensWithBalance";
import { isDust } from "efi/coins/isDust";
import { getTokenInfo } from "efi/tokenlists/tokenlists";
import { trancheContracts } from "efi/tranche/tranches";
import { Tranche } from "elf-contracts-typechain/dist/types/Tranche";
import { PrincipalTokenInfo } from "@elementfi/tokenlist";

/**
 * Returns the list of principal token infos that have a non-dust balance for
 * the given account.
 */
export function usePrincipalTokensWithoutDust(
  account: string | null | undefined
): PrincipalTokenInfo[] {
  const principalTokensWithBalanceResults = useTokensWithBalance(
    account,
    // Note: we're checking all tranche contracts in the system for a balance
    trancheContracts
  );

  const principalTokenInfosWithBalance = principalTokensWithBalanceResults.map(
    ({ token }) => getTokenInfo<PrincipalTokenInfo>(token.address)
  );

  // filter out dust, because redeeming a PT can leave a small amount of dust in
  // the user's account
  const principalTokensWithoutDust = zip(
    principalTokensWithBalanceResults,
    principalTokenInfosWithBalance
  )
    .filter(
      (
        zipped
      ): zipped is [
        { token: Tranche; balanceOf: BigNumber },
        PrincipalTokenInfo
      ] => zipped.every((v) => !!v)
    )
    .filter(
      ([{ balanceOf }, principalTokenInfo]) =>
        !isDust(balanceOf, principalTokenInfo.decimals)
    )
    .map(([unusedTokenWithBalance, principalTokenInfo]) => principalTokenInfo);

  return principalTokensWithoutDust;
}
