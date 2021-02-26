import { Provider } from "@ethersproject/providers";
import { YC, YC__factory } from "elf-contracts/types";
import { BigNumber } from "ethers";
import zip from "lodash.zip";

import { getQueriesData } from "efi-ui/base/queryResults";
import { useSmartContractReadCalls } from "efi-ui/contracts/useSmartContractReadCalls/useSmartContractReadCalls";
import { useSmartContractsFromFactory } from "efi-ui/contracts/useSmartContractsFromFactory/useSmartContractsFromFactory";
import { useTrancheContracts } from "efi-ui/tranche/useTrancheContracts";

export function useYCsWithBalance(
  account: string | null | undefined,
  provider?: Provider
): YC[] {
  // YCs are sourced from the Tranche contracts
  const tranches = useTrancheContracts(provider);
  const ycAddressResults = useSmartContractReadCalls(tranches, "yc");
  const ycContracts = useSmartContractsFromFactory(
    getQueriesData(ycAddressResults),
    YC__factory.connect
  );

  // const ycBalanceResults = useSmartContractReadCalls(ycContracts, "balanceOf", {
  //   callArgs: [account as string],
  //   enabled: !!account,
  // });

  // const loadedData = zip(
  //   ycContracts,
  //   getQueriesData(ycBalanceResults)
  // ).filter((values): values is [YC, BigNumber] =>
  //   values.every((value) => !!value)
  // );

  // const ycsWithBalance = loadedData
  //   .filter(([yc, balanceOf]) => balanceOf.gt(0))
  //   .map(([yc]) => yc);

  // return ycsWithBalance;

  return [];
}
