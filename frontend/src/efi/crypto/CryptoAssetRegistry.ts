import { AddressesJson } from "efi/addresses";
import { getSmartContractFromRegistry } from "efi/contracts/SmartContractsRegistry";
import {
  CryptoAsset,
  CryptoAssetType,
  Erc20CryptoAsset,
  Erc20PermitCryptoAsset,
  ETHEREUM_CRYPTO_ASSET,
} from "efi/crypto/CryptoAsset";
import { yieldTokenInfos } from "efi/interestToken/interestToken";
import { principalTokenInfos } from "efi/tranche/tranches";
import { underlyingContractsByAddress } from "efi/underlying/underlying";
import { ERC20, ERC20Permit } from "elf-contracts/types";
import { InterestToken__factory } from "elf-contracts/types/factories/InterestToken__factory";
import { Tranche__factory } from "elf-contracts/types/factories/Tranche__factory";
import { InterestToken } from "elf-contracts/types/InterestToken";
import { Tranche } from "elf-contracts/types/Tranche";
import keyBy from "lodash.keyby";

const USDC_CRYPTO_ASSET: Erc20PermitCryptoAsset = {
  id: AddressesJson.addresses.usdcAddress,
  type: CryptoAssetType.ERC20PERMIT,
  tokenContract: underlyingContractsByAddress[
    AddressesJson.addresses.usdcAddress
  ] as ERC20Permit,
};

const DAI_CRYPTO_ASSET: Erc20CryptoAsset = {
  id: AddressesJson.addresses.daiAddress,
  type: CryptoAssetType.ERC20,
  tokenContract: underlyingContractsByAddress[
    AddressesJson.addresses.daiAddress
  ] as ERC20,
};

const CRVLUSD_CRYPTO_ASSET: Erc20CryptoAsset = {
  id: AddressesJson.addresses.crvlusdAddress,
  type: CryptoAssetType.ERC20,
  tokenContract: underlyingContractsByAddress[
    AddressesJson.addresses.crvlusdAddress
  ] as ERC20,
};

const CRVALUSD_CRYPTO_ASSET: Erc20CryptoAsset = {
  id: AddressesJson.addresses.crvalusdAddress,
  type: CryptoAssetType.ERC20,
  tokenContract: underlyingContractsByAddress[
    AddressesJson.addresses.crvalusdAddress
  ] as ERC20,
};

const baseAssetCryptoAssets: Record<string, CryptoAsset> = {
  // weth should return eth wherever it's used, because the user should never
  // interact with weth
  [AddressesJson.addresses.wethAddress]: ETHEREUM_CRYPTO_ASSET,
  [AddressesJson.addresses.usdcAddress]: USDC_CRYPTO_ASSET,
  [AddressesJson.addresses.daiAddress]: DAI_CRYPTO_ASSET,
  [AddressesJson.addresses.crvlusdAddress]: CRVLUSD_CRYPTO_ASSET,
  [AddressesJson.addresses.crvalusdAddress]: CRVALUSD_CRYPTO_ASSET,
};

const principalTokenCryptoAssets: Erc20PermitCryptoAsset[] =
  principalTokenInfos.map(({ address }) => ({
    id: address,
    // All of our principal tokens follow the erc20Permit token standard.
    type: CryptoAssetType.ERC20PERMIT,
    tokenContract: getSmartContractFromRegistry(
      address,
      Tranche__factory.connect
    ) as Tranche,
  }));
const yieldTokenCryptoAssets: Erc20PermitCryptoAsset[] = yieldTokenInfos.map(
  ({ address }) => ({
    id: address,
    // All of our yield tokens follow the erc20Permit token standard.
    type: CryptoAssetType.ERC20PERMIT,
    tokenContract: getSmartContractFromRegistry(
      address,
      InterestToken__factory.connect
    ) as InterestToken,
  })
);

/**
 * Lookup object to get the CryptoAsset of a token.
 *
 * NOTE: Lookups for weth will return the Ethereum crypto asset.
 */
export const CryptoAssets: Record<string, CryptoAsset> = Object.freeze({
  ...baseAssetCryptoAssets,
  ...keyBy(
    principalTokenCryptoAssets,
    ({ tokenContract }) => tokenContract.address
  ),
  ...keyBy(
    yieldTokenCryptoAssets,
    ({ tokenContract }) => tokenContract.address
  ),
});
