import { addressesJsonId } from "efi/addresses";
import { ONE_DAY_IN_SECONDS } from "efi/base/time";

// TODO: get a better source for this.  I picked this up from https://etherscan.io/chart/blocktime
// the average for this entire year is about 13.1s / block.  For local development though we just
// use 100 blocks to represent one day.
const chainName = addressesJsonId;
const PRODUCTION = process.env.NODE_ENV === "production";
function getMineRate() {
  if (PRODUCTION) {
    return 13.1;
  }

  if (chainName === "goerli") {
    return 30;
  }

  // default to local testnet, where we just use last 100 events
  return ONE_DAY_IN_SECONDS / 100;
}

export const AVG_MINE_RATE_SECONDS = getMineRate();
