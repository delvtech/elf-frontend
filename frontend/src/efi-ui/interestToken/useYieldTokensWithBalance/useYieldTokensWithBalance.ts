import { Provider } from "@ethersproject/providers";
import { InterestToken__factory } from "elf-contracts/types/factories/InterestToken__factory";
import { InterestToken } from "elf-contracts/types/InterestToken";
import { BigNumber } from "ethers";
import zip from "lodash.zip";

import { getQueriesData } from "efi-ui/base/queryResults";
import { useSmartContractFromFactoryMulti } from "efi-ui/contracts/useSmartContractFromFactory/useSmartContractFromFactory";
import { useSmartContractReadCalls } from "efi-ui/contracts/useSmartContractReadCalls/useSmartContractReadCalls";
import { useTrancheInterestTokenMulti } from "efi-ui/tranche/useTrancheInterestTokenMulti";
import { TrancheContracts } from "efi/tranche/tranches";

export function useYieldTokensWithBalance(
  account: string | null | undefined,
  provider?: Provider
): InterestToken[] {
  // InterestTokens are sourced from the Tranche contracts
  const interestTokenAddressResults =
    useTrancheInterestTokenMulti(TrancheContracts);
  const interestTokenContracts = useSmartContractFromFactoryMulti(
    getQueriesData(interestTokenAddressResults),
    InterestToken__factory.connect
  );

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
    .filter(([interestToken, balanceOf]) => balanceOf.gt(0))
    .map(([interestToken]) => interestToken);

  return interestTokensWithBalance;
}
