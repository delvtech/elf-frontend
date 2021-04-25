// Import statements in TS are statically checked, and will throw compile-time
// errors if the file doesn't exist. Require statements on the other hand are
// dynamic and will throw an error at runtime. For tools like eslint and
// dependency-cruiser, we don't need to run the app, but we need TS to compile
// correctly, so we use a require() statement here.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ContractAddresses: ContractJson = require("local.addresses.json");
export interface ContractJson {
  elementAddress: string;
  balancerVaultAddress: string;
  trancheFactoryAddress: string;
  interestTokenFactoryAddress: string;
  weightedPoolFactoryAddress: string;
  convergentPoolFactoryAddress: string;
  userProxyContractAddress: string;
  wethAddress: string;
  usdcAddress: string;
}

/**
 * Helpful debugging tool for making sure a contract is from our contracts json
 */
export function lookupAddressKey(
  address: string | undefined
): string | undefined {
  const [addressesJsonKey] =
    Object.entries(ContractAddresses).find(
      ([key, value]) => value === address
    ) || [];
  return addressesJsonKey;
}

export const KNOWN_ERC20_TOKENS = [ContractAddresses.wethAddress];
export const KNOWN_ERC20PERMIT_TOKENS = [ContractAddresses.usdcAddress];

export const KNOWN_BASE_ASSETS = [
  ...KNOWN_ERC20_TOKENS,
  ...KNOWN_ERC20PERMIT_TOKENS,
];

export default ContractAddresses;
