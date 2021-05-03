import { Tranche } from "elf-contracts/types/Tranche";
import zip from "lodash.zip";

import { getQueriesData } from "efi-ui/base/queryResults";
import { convertEpochSecondsToDate } from "efi/base/convertEpochSecondsToDate";
import { BigNumber } from "ethers";
import { useTrancheUnlockTimestampMulti } from "./useTrancheUnlockTimestamp";
import { TrancheContracts } from "efi/tranche/tranches";

export function useOpenTranches(): Tranche[] {
  const unlockTimestampResults = useTrancheUnlockTimestampMulti(
    TrancheContracts
  );

  if (!TrancheContracts.length) {
    return [];
  }

  const unlockTimestamps = getQueriesData(
    unlockTimestampResults
  ).map((unlockTimestamp: BigNumber | undefined) =>
    convertEpochSecondsToDate(unlockTimestamp)
  );

  const now = new Date();
  const openTranches = zip(TrancheContracts, unlockTimestamps)
    .filter((entry): entry is [Tranche, Date] => !entry.includes(undefined))
    .filter(([tranche, unlockDate]) => now.getTime() < unlockDate.getTime())
    .map(([tranche]) => tranche);

  return openTranches;
}
