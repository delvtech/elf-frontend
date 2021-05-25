import { getSmartContractFromRegistry } from "efi/contracts/SmartContractsRegistry";
import { AddressesJson } from "efi/addresses";
import { WETH__factory } from "elf-contracts/types/factories/WETH__factory";
import { USDC__factory } from "elf-contracts/types/factories/USDC__factory";

const {
  addresses: { wethAddress, usdcAddress },
} = AddressesJson;

const wethContract = getSmartContractFromRegistry(
  wethAddress,
  WETH__factory.connect
);
const usdcContract = getSmartContractFromRegistry(
  usdcAddress,
  USDC__factory.connect
);

/**
 * Lookup the contract instance for a underlying's address.
 */
export const underlyingContracts = Object.freeze({
  [wethAddress]: wethContract,
  [usdcAddress]: usdcContract,
});
