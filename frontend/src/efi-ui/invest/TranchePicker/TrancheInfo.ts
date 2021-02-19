import { Tranche } from "elf-contracts/types/Tranche";
import { BigNumber } from "ethers";

export interface TrancheInfo {
  tranche: Tranche;
  symbol: string | undefined;
  name: string | undefined;
  unlockTimestamp: BigNumber | undefined;

  // TODO
  apy: number | undefined;
}
