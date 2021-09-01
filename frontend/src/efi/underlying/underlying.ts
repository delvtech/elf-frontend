import {
  DAI__factory,
  ERC20__factory,
  ERC20Permit__factory,
} from "elf-contracts-typechain/dist/types";
import { WETH__factory } from "elf-contracts-typechain/dist/types/factories/WETH__factory";

import { AddressesJson } from "efi/addresses";
import { defaultProvider } from "efi/providers/providers";

const {
  addresses: {
    wethAddress,
    wbtcAddress,
    usdcAddress,
    daiAddress,
    crvalusdAddress = "0x0000000000000000000000000000000000000000",
    crv3cryptoAddress,
    crvtricryptoAddress,
    stecrvAddress,
  },
} = AddressesJson;
const crvlusdAddress = AddressesJson.addresses["lusd3crv-fAddress"];

const wethContract = WETH__factory.connect(wethAddress, defaultProvider);
const wbtcContract = ERC20__factory.connect(wbtcAddress, defaultProvider);
const usdcContract = ERC20Permit__factory.connect(usdcAddress, defaultProvider);
const daiContract = DAI__factory.connect(daiAddress, defaultProvider);
const crvlusdContract = ERC20__factory.connect(crvlusdAddress, defaultProvider);
const crvalusdContract = ERC20__factory.connect(
  crvalusdAddress,
  defaultProvider
);
const crvTricryptoContract = ERC20__factory.connect(
  crvtricryptoAddress,
  defaultProvider
);
const crv3CryptoContract = ERC20__factory.connect(
  crv3cryptoAddress,
  defaultProvider
);

const steCrvContract = ERC20__factory.connect(stecrvAddress, defaultProvider);

/**
 * Lookup the contract instance for a underlying's address.
 */
export const underlyingContractsByAddress = Object.freeze({
  [wethAddress]: wethContract,
  [wbtcAddress]: wbtcContract,
  [usdcAddress]: usdcContract,
  [daiAddress]: daiContract,
  [crvlusdAddress]: crvlusdContract,
  [crvalusdAddress]: crvalusdContract,
  [crvtricryptoAddress]: crvTricryptoContract,
  [crv3cryptoAddress]: crv3CryptoContract,
  [stecrvAddress]: steCrvContract,
});

const underlyingERC20PermitAddresses = [usdcAddress];
export function isUnderlyingAddressERC20Permit(
  underlyingAddress: string
): boolean {
  return underlyingERC20PermitAddresses.includes(underlyingAddress);
}
