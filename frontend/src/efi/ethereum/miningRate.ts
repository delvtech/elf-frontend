import { AddressesJson } from "efi/addresses";
import { ONE_DAY_IN_SECONDS } from "efi/base/time";
import { ChainId, ChainSymbols } from "efi/ethereum";

const chainName = getChainName();
function getChainName() {
  const chainSymbol = ChainSymbols[AddressesJson.chainId as ChainId];
  if (process.env.NODE_ENV === "test") {
    return "mock";
  }
  // Default to the testnet in this repo so `npm start` Just Works without having
  // to specify it on the command line.
  return chainSymbol || "testnet";
}

// TODO: get a better source for this.  I picked this up from https://etherscan.io/chart/blocktime
// the average for this entire year is about 13.1s / block.  For local development though we just
// use 100 blocks to represent one day.
// Look into using:
// https://api.etherscan.io/api?module=block&action=getblocknobytime&timestamp=1578638524&closest=before&apikey=<API_KEY>
// we can use their api just for the block number at timestamp.  they have a 5req/s limit per IP
// which we shouldn't hit if we only use for this.
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
