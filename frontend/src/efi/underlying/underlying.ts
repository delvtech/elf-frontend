import { getSmartContractFromRegistry } from "efi/contracts/SmartContractsRegistry";
import { AddressesJson } from "efi/addresses";
import { WETH__factory } from "elf-contracts/types/factories/WETH__factory";
import {
  ERC20,
  ERC20Permit,
  ERC20Permit__factory,
  ERC20__factory,
  WETH,
} from "elf-contracts/types";

const {
  addresses: { wethAddress, usdcAddress, daiAddress },
} = AddressesJson;

const wethContract = getSmartContractFromRegistry(
  wethAddress,
  WETH__factory.connect
) as WETH;

const usdcContract = getSmartContractFromRegistry(
  usdcAddress,
  ERC20Permit__factory.connect
) as ERC20Permit;

const daiContract = getSmartContractFromRegistry(
  daiAddress,
  // TODO: get a DAI__factory
  ERC20__factory.connect
) as ERC20;

/**
 * Lookup the contract instance for a underlying's address.
 */
export const underlyingContractsByAddress = Object.freeze({
  [wethAddress]: wethContract,
  [usdcAddress]: usdcContract,
  [daiAddress]: daiContract,
});

const underlyingERC20PermitAddresses = [usdcAddress];
export function isUnderlyingAddressERC20Permit(
  underlyingAddress: string
): boolean {
  return underlyingERC20PermitAddresses.includes(underlyingAddress);
}
