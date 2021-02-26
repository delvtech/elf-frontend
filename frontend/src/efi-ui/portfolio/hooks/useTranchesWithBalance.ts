import { Provider } from "@ethersproject/providers";
import { BigNumber } from "ethers";

import { getQueriesData } from "efi-ui/base/queryResults";
import {
  useSmartContractReadCalls,
  UseSmartContractReadCallsOptions,
} from "efi-ui/contracts/useSmartContractReadCalls/useSmartContractReadCalls";
import { useTrancheContracts } from "efi-ui/tranche/useTrancheContracts";
import zip from "lodash.zip";
import { Tranche } from "elf-contracts/types/Tranche";

export function useTranchesWithBalance(
  account: string | null | undefined,
  provider?: Provider
): Tranche[] {
  const tranches = useTrancheContracts(provider);

  const balanceOfArgs: UseSmartContractReadCallsOptions<
    Tranche,
    "balanceOf"
  >[] = tranches.map(() => ({
    callArgs: [account as string],
    enabled: !!account,
  }));

  const tokenBalanceOfResults = useSmartContractReadCalls(
    tranches,
    "balanceOf",
    balanceOfArgs
  );

  const loadedData = zip(
    tranches,
    getQueriesData(tokenBalanceOfResults)
  ).filter((values): values is [Tranche, BigNumber] =>
    values.every((value) => !!value)
  );

  const tranchesWithBalance = loadedData
    .filter(([tranche, balanceOf]) => balanceOf.gt(0))
    .map(([tranche]) => tranche);

  return tranchesWithBalance;
}
