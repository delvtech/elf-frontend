import { Market } from "efi/markets/Market";

const nextFeb = new Date("2021-2-1");
// const nextMarch = new Date("2021-3-1");
// const nextJune = new Date("2021-6-1");
const nextJuly = new Date("2021-7-1");
// const nextDecember = new Date("2021-12-1");

const lastDecember = new Date("2020-12-1");
const lastSeptember = new Date("2020-9-1");
// const lastJune = new Date("2020-6-1");

export const stubbedMarkets: Market[] = [
  {
    contractAddress: "0x1111111111111111",
    trancheContractAddress: "0xAAAAAAAAAAAAAAAA",
    id: "eth-fyeth-2020-2-1",
    name: "ETH - fyETH",
    description: "Automated market to trade ETH with fixed yield ETH",
    assets: [],
    yieldAssetType: "FYT",
    startDate: nextFeb.getTime(),
    maturityDate: nextJuly.getTime(),
    state: "queued",
  },
  {
    contractAddress: "0x2222222222222222",
    trancheContractAddress: "0xAAAAAAAAAAAAAAAA",
    id: "eth-yceth-2020-2-1",
    name: "ETH - ycETH",
    description: "Automated market to trade ETH with ETH yield coupons",
    assets: [],
    yieldAssetType: "YC",
    startDate: nextFeb.getTime(),
    maturityDate: nextJuly.getTime(),
    state: "queued",
  },
  {
    contractAddress: "0x1111111111111111",
    trancheContractAddress: "0xAAAAAAAAAAAAAAAA",
    id: "eth-fyeth-2020-2-1",
    name: "ETH - fyETH",
    description: "Automated market to trade ETH with fixed yield ETH",
    assets: [],
    yieldAssetType: "FYT",
    maturityDate: nextFeb.getTime(),
    startDate: lastDecember.getTime(),
    state: "running",
  },
  {
    contractAddress: "0x2222222222222222",
    trancheContractAddress: "0xAAAAAAAAAAAAAAAA",
    id: "eth-yceth-2020-2-1",
    name: "ETH - ycETH",
    description: "Automated market to trade ETH with ETH yield coupons",
    assets: [],
    yieldAssetType: "YC",
    maturityDate: nextFeb.getTime(),
    startDate: lastDecember.getTime(),
    state: "running",
  },
  {
    contractAddress: "0x1111111111111111",
    trancheContractAddress: "0xAAAAAAAAAAAAAAAA",
    id: "eth-fyeth-2020-2-1",
    name: "ETH - fyETH",
    description: "Automated market to trade ETH with fixed yield ETH",
    assets: [],
    yieldAssetType: "FYT",
    maturityDate: nextJuly.getTime(),
    startDate: lastDecember.getTime(),
    state: "running",
  },
  {
    contractAddress: "0x2222222222222222",
    trancheContractAddress: "0xAAAAAAAAAAAAAAAA",
    id: "eth-yceth-2020-2-1",
    name: "ETH - ycETH",
    description: "Automated market to trade ETH with ETH yield coupons",
    assets: [],
    yieldAssetType: "YC",
    maturityDate: nextJuly.getTime(),
    startDate: lastDecember.getTime(),
    state: "running",
  },
  {
    contractAddress: "0x1111111111111111",
    trancheContractAddress: "0xAAAAAAAAAAAAAAAA",
    id: "eth-fyeth-2020-2-1",
    name: "ETH - fyETH",
    description: "Automated market to trade ETH with fixed yield ETH",
    assets: [],
    yieldAssetType: "FYT",
    maturityDate: lastDecember.getTime(),
    startDate: lastSeptember.getTime(),
    state: "closed",
  },
  {
    contractAddress: "0x2222222222222222",
    trancheContractAddress: "0xAAAAAAAAAAAAAAAA",
    id: "eth-yceth-2020-2-1",
    name: "ETH - ycETH",
    description: "Automated market to trade ETH with ETH yield coupons",
    assets: [],
    yieldAssetType: "YC",
    maturityDate: lastDecember.getTime(),
    startDate: lastSeptember.getTime(),
    state: "closed",
  },
];
