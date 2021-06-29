import { getSmartContractFromRegistry } from "efi/contracts/SmartContractsRegistry";
import { AddressesJson } from "efi/addresses";
import { WETH__factory } from "elf-contracts/types/factories/WETH__factory";
import {
  CRVLUSD,
  CRVLUSD__factory,
  DAI,
  DAI__factory,
  ERC20Permit,
  ERC20Permit__factory,
  WETH,
} from "elf-contracts/types";

const {
  addresses: { wethAddress, usdcAddress, daiAddress, crvlusdAddress },
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
  DAI__factory.connect
) as DAI;

const crvlusdContract = getSmartContractFromRegistry(
  crvlusdAddress,
  CRVLUSD__factory.connect
) as CRVLUSD;

/**
 * Lookup the contract instance for a underlying's address.
 */
export const underlyingContractsByAddress = Object.freeze({
  [wethAddress]: wethContract,
  [usdcAddress]: usdcContract,
  [daiAddress]: daiContract,
  [crvlusdAddress]: crvlusdContract,
});

const underlyingERC20PermitAddresses = [usdcAddress];
export function isUnderlyingAddressERC20Permit(
  underlyingAddress: string
): boolean {
  return underlyingERC20PermitAddresses.includes(underlyingAddress);
}
