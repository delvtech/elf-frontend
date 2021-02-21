interface ContractJson {
  elementAddress: string;
  userAddress: string;
  userProxyContractAddress: string;
  elfFactoryAddress: string;
  bFactoryAddress: string;
  wethAddress: string;
  elfWethAddress: string;
  trancheWethAddress: string;
  marketWethFYTAddress: string;
  marketWethYCAddress: string;
  usdcAddress: string;
  elfUsdcAddress: string;
  trancheUsdcAddress: string;
  bPoolUsdcAddress: string;
  marketUsdcFYTAddress: string;
  marketUsdcYCAddress: string;
}

// TODO: Are there defaults here we want to use? Should we warn when they are
// being used? ie: "Missing contracts.json, falling back to xyz"
const FALLBACK_CONTRACTS = Object.freeze<ContractJson>({
  elementAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  userAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  userProxyContractAddress: "0xb7278A61aa25c888815aFC32Ad3cC52fF24fE575",
  elfFactoryAddress: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
  bFactoryAddress: "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707",
  wethAddress: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  elfWethAddress: "0x856e4424f806D16E8CBC702B3c0F2ede5468eae5",
  trancheWethAddress: "0x610178dA211FEF7D417bC0e6FeD39F05609AD788",
  marketWethFYTAddress: "0x61c36a8d610163660E21a8b7359e1Cac0C9133e1",
  marketWethYCAddress: "0x23dB4a08f2272df049a4932a4Cc3A6Dc1002B33E",
  usdcAddress: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  elfUsdcAddress: "0xb0279Db6a2F1E01fbC8483FCCef0Be2bC6299cC3",
  trancheUsdcAddress: "0x9E545E3C0baAB3E08CdfD552C960A1050f373042",
  bPoolUsdcAddress: "0x8EFa1819Ff5B279077368d44B593a4543280e402",
  marketUsdcFYTAddress: "0x8EFa1819Ff5B279077368d44B593a4543280e402",
  marketUsdcYCAddress: "0x6743E5c6E1B453372507E8dfD6CA53508721425B",
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
