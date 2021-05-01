import "@nomiclabs/hardhat-waffle";
import "hardhat-typechain";
import "module-alias/register";

import { HardhatUserConfig, task, types } from "hardhat/config";

task("intervalMining", "Mine blocks on an interval")
  .addOptionalParam(
    "interval",
    "ms interval to mine blocks at. default is 10s",
    10000,
    types.int
  )
  .setAction(async (taskArgs, hre) => {
    const { interval } = taskArgs;
    await hre.ethers.provider.send("evm_setAutomine", [false]);
    await hre.ethers.provider.send("evm_setIntervalMining", [interval]);
  });

task("autoMine", "Mine blocks on every transaction automatically").setAction(
  async (taskArgs, hre) => {
    await hre.ethers.provider.send("evm_setAutomine", [true]);
    await hre.ethers.provider.send("evm_setIntervalMining", [0]);
  }
);

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
        version: "0.7.1",
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
    goerli: {
      url:
        "https://eth-goerli.alchemyapi.io/v2/fBuOKVPGvseZZb0h8HyPIDqtKC7nslig",
    },
  },
};

export default config;
