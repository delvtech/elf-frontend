import { Provider } from "@ethersproject/providers";
import { BigNumber, Event } from "ethers";

import { ONE_ETHER } from "efi/crypto/ethereum";

// TODO: make these look like NewTranche events
const event1 = {} as NewTranche;
const event2 = {} as NewTranche;
const event3 = {} as NewTranche;

export type NewTranche = Event;

export class TrancheFactory__factory {
  static connect = (address: string, provider: Provider) => {
    return new TrancheFactory(address);
  };
}

export class TrancheFactory {
  readonly address: string;
  constructor(address: string) {
    this.address = address;
  }
  queryFilter = async () => [event1, event2, event3];
}

export class Tranche__factory {
  static connect = (address: string, provider: Provider) => {
    return new Tranche(address);
  };
}

export class Tranche {
  readonly address: string;
  constructor(address: string) {
    this.address = address;
  }
  yc = async (): Promise<[string]> => {
    if (this.address === "0xTRANCHE_ETH_1") {
      return ["0xYC_ETH_1"];
    }
    if (this.address === "0xTRANCHE_USDC_1") {
      return ["0xYC_USDC_1"];
    }

    // should never get here
    return [""];
  };
  functions = {
    balanceOf: async (account: string): Promise<[BigNumber]> => {
      return [ONE_ETHER];
    },
  };
}

export class ERC20__factory {
  static connect = (address: string, provider: Provider) => {
    return new ERC20(address);
  };
}

export class ERC20 {
  readonly address: string;
  constructor(address: string) {
    this.address = address;
  }
  functions = {
    balanceOf: async (account: string): Promise<[BigNumber]> => {
      return [ONE_ETHER];
    },
  };
}

// Use for BPool contract
// const getMarketFunctions = () => ({
//   getCurrentTokens: async () => [
//     WETH_CONTRACT_ADDRESS_LOCALNET,
//     MOCK_TRANCHE_ADDRESSES[0],
//   ],
// });
