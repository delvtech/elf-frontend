interface ContractJson {
  ELF_DEPLOY: string;
  ELF_PROXY: string;
  ELF: string;
  WETH: string;
}

// TODO: Are there defaults here we want to use? Should we warn when they are
// being used? ie: "Missing contracts.json, falling back to xyz"
const FALLBACK_CONTRACTS = Object.freeze<ContractJson>({
  ELF_DEPLOY: "",
  ELF_PROXY: "",
  ELF: "",
  WETH: "",
});

// Import statements in TS are statically checked, and will throw compile-time
// errors if the file doesn't exist. Require statements on the other hand are
// dynamic and will throw an error at runtime. For tools like eslint and
// dependency-cruiser, we don't need to run the app, but we need TS to compile
// correctly, so we use a require() statement here.
let ContractAddresses: ContractJson;
try {
  ContractAddresses = require("contracts.json");
} catch {
  ContractAddresses = FALLBACK_CONTRACTS;
}

// Re-export so auto-import Just Works, and we don't need to remember the above fun fact.
export default ContractAddresses;
