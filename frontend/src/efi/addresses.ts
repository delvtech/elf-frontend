import { AddressesJsonFile } from "addresses/AddressesJsonFile";

// Default to the testnet in this repo so `npm start` Just Works without having
// to specify it on the command line.
const addressesJsonId = process.env.REACT_APP_CHAIN_NAME || "testnet";

// Import statements in TS are statically checked, and will throw compile-time
// errors if the file doesn't exist. Require statements on the other hand are
// dynamic and will throw an error at runtime. For tools like eslint and
// dependency-cruiser, we don't need to run the app, but we need TS to compile
// correctly, so we use a require() statement here.
// eslint-disable-next-line @typescript-eslint/no-var-requires
export const AddressesJson: AddressesJsonFile = require(`addresses/${addressesJsonId}.addresses.json`);

const ContractAddresses = AddressesJson.addresses;
export default ContractAddresses;

/**
 * Helpful debugging tool for making sure a contract is from our contracts json
 */
export function lookupAddressKey(
  address: string | undefined
): string | undefined {
  const [addressesJsonKey] =
    Object.entries(AddressesJson.addresses).find(
      ([key, value]) => value === address
    ) || [];
  return addressesJsonKey;
}

export const KNOWN_ERC20_TOKENS = [ContractAddresses.wethAddress];
export const KNOWN_ERC20PERMIT_TOKENS = [AddressesJson.addresses.usdcAddress];

export const KNOWN_BASE_ASSETS = [
  ...KNOWN_ERC20_TOKENS,
  ...KNOWN_ERC20PERMIT_TOKENS,
];
