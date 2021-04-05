import "@nomiclabs/hardhat-waffle";
import "hardhat-typechain";
import "module-alias/register";

import { HardhatUserConfig, task } from "hardhat/config";

// import { simpleSwaps } from "src/tasks/simpleSwaps";
// task("swaps", "perform some swaps", simpleSwaps);

const config: HardhatUserConfig = {
  paths: {
    sources: "src",
    tests: "src/tests",
  },
  solidity: {
    compilers: [
      {
        version: "0.5.12",
      },
      {
        version: "0.7.0",
      },
      {
        version: "0.8.0",
      },
    ],
  },
  typechain: {
    outDir: "src/types",
    target: "ethers-v5",
  },

  networks: {
    hardhat: {
      gas: 1000000000000000000,
      blockGasLimit: 0x1fffffffffffff,
      allowUnlimitedContractSize: true,
    },
  },
};

export default config;
