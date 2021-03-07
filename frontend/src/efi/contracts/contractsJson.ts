interface ContractJson {
  elementAddress: string;
  balancerAddress: string;
  userAddress: string;
  balancerVaultAddress: string;
  yearnVaultAssetProxyAddress: string;
  marketFyWethAddress: string;
  marketFyWethId: string;
  userProxyContractAddress: string;
  wethAddress: string;
  wethTrancheAddress: string;
  usdcAddress: string;
}

// TODO: Are there defaults here we want to use? Should we warn when they are
// being used? ie: "Missing contracts.json, falling back to xyz"
const FALLBACK_CONTRACTS = Object.freeze<ContractJson>({
  elementAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  balancerAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  userAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  balancerVaultAddress: "0x0165878A594ca255338adfa4d48449f69242Eb8F",
  yearnVaultAssetProxyAddress: "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318",
  marketFyWethAddress: "0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e",
  marketFyWethId:
    "0xb7f8bc63bbcad18155201308c8f3540b07f84f5e000100000000000000000000",
  userProxyContractAddress: "0x68B1D87F95878fE05B998F19b66F4baba5De1aed",
  wethAddress: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  wethTrancheAddress: "0x610178dA211FEF7D417bC0e6FeD39F05609AD788",
  usdcAddress: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
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
