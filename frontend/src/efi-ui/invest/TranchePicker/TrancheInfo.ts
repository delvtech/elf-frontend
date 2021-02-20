import { Tranche } from "elf-contracts/types/Tranche";
import { BigNumber } from "ethers";

export interface TrancheInfo {
  tranche: Tranche;
  symbol: string | undefined;
  name: string | undefined;
  unlockTimestamp: BigNumber | undefined;

  vaultName: string | undefined;

  // TODO
  apy: number | undefined;
}
