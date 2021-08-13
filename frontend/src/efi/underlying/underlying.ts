import { AddressesJson } from "efi/addresses";
import { WETH__factory } from "elf-contracts-typechain/dist/types/factories/WETH__factory";
import {
  DAI__factory,
  ERC20Permit__factory,
  ERC20__factory,
} from "elf-contracts-typechain/dist/types";
import { defaultProvider } from "efi/providers/providers";

const {
  addresses: {
    wethAddress,
    usdcAddress,
    daiAddress,
    crvlusdAddress,
    crvalusdAddress,
    crv3cryptoAddress,
    crvtricryptoAddress,
    stecrvAddress,
  },
} = AddressesJson;

const wethContract = WETH__factory.connect(wethAddress, defaultProvider);
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
