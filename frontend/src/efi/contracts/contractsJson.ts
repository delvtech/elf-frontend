interface ContractJson {
  elementAddress: string;
  userAddress: string;
  elfFactoryAddress: string;
  bFactoryAddress: string;
  wethAddress: string;
  elfWethAddress: string;
  trancheWethAddress: string;
  bPoolWethAddress: string;
  usdcAddress: string;
  elfUsdcAddress: string;
  trancheUsdcAddress: string;
  bPoolUsdcAddress: string;
}

// TODO: Are there defaults here we want to use? Should we warn when they are
// being used? ie: "Missing contracts.json, falling back to xyz"
const FALLBACK_CONTRACTS = Object.freeze<ContractJson>({
  elementAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  userAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  elfFactoryAddress: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
  bFactoryAddress: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
  wethAddress: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  elfWethAddress: "0x75537828f2ce51be7289709686A69CbFDbB714F1",
  trancheWethAddress: "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6",
  bPoolWethAddress: "0xd8058efe0198ae9dD7D563e1b4938Dcbc86A1F81",
  usdcAddress: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  elfUsdcAddress: "0xE451980132E65465d0a498c53f0b5227326Dd73F",
  trancheUsdcAddress: "0xa85233C63b9Ee964Add6F2cffe00Fd84eb32338f",
  bPoolUsdcAddress: "0x6D544390Eb535d61e196c87d6B9c80dCD8628Acd",
});

// Import statements in TS are statically checked, and will throw compile-time
// errors if the file doesn't exist. Require statements on the other hand are
// dynamic and will throw an error at runtime. For tools like eslint and
// dependency-cruiser, we don't need to run the app, but we need TS to compile
// correctly, so we use a require() statement here.
let ContractAddresses: ContractJson;
try {
  ContractAddresses = require("addresses.json");
} catch {
  ContractAddresses = FALLBACK_CONTRACTS;
}

// Re-export so auto-import Just Works, and we don't need to remember the above fun fact.
export default ContractAddresses;
