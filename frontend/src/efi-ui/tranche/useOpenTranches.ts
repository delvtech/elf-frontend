import { Tranche } from "elf-contracts/types/Tranche";
import zip from "lodash.zip";

import { getQueriesData } from "efi-ui/base/queryResults";
import { useSmartContractReadCalls } from "efi-ui/contracts/useSmartContractReadCalls/useSmartContractReadCalls";
import { useTrancheContracts } from "efi-ui/tranche/useTrancheContracts";
import { convertEpochSecondsToDate } from "efi/base/convertEpochSecondsToDate";
import { BigNumber } from "ethers";

export function useOpenTranches(): Tranche[] {
  const allTranches = useTrancheContracts();
  const unlockTimestampResults = useSmartContractReadCalls(
    allTranches,
    "unlockTimestamp"
  );

  if (!allTranches.length) {
    return [];
  }

  const unlockTimestamps = getQueriesData(
    unlockTimestampResults
  ).map((unlockTimestamp: BigNumber | undefined) =>
    convertEpochSecondsToDate(unlockTimestamp)
  );

  const now = new Date();
  const openTranches = zip(allTranches, unlockTimestamps)
    .filter((entry): entry is [Tranche, Date] => !entry.includes(undefined))
    .filter(([tranche, unlockDate]) => now.getTime() < unlockDate.getTime())
    .map(([tranche]) => tranche);

  return openTranches;
}
