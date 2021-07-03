import { InterestToken } from "elf-contracts/types/InterestToken";
import { BigNumber } from "ethers";
import zip from "lodash.zip";

import { getQueriesData } from "efi-ui/base/queryResults";
import { useSmartContractReadCalls } from "efi-ui/contracts/useSmartContractReadCalls/useSmartContractReadCalls";
import { interestTokenContracts } from "efi/interestToken/interestToken";

export function useYieldTokensWithBalance(
  account: string | null | undefined
): InterestToken[] {
  // InterestTokens are sourced from the Tranche contracts

  const interestTokenBalanceResults = useSmartContractReadCalls(
    interestTokenContracts,
    "balanceOf",
    {
      callArgs: [account as string],
      enabled: !!account,
    }
  );

  const loadedData = zip(
    interestTokenContracts,
    getQueriesData(interestTokenBalanceResults)
  ).filter((values): values is [InterestToken, BigNumber] =>
    values.every((value) => !!value)
  );

  const interestTokensWithBalance = loadedData
    .filter(([unusedInterestToken, balanceOf]) => balanceOf.gt(0))
    .map(([interestToken]) => interestToken);

  return interestTokensWithBalance;
}
