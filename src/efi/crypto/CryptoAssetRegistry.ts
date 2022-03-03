import { ERC20, ERC20Permit } from "@elementfi/core-typechain";
import { AddressesJson } from "efi/addresses/addresses";
import {
  CryptoAsset,
  CryptoAssetType,
  Erc20CryptoAsset,
  Erc20PermitCryptoAsset,
  ETHEREUM_CRYPTO_ASSET,
} from "efi/crypto/CryptoAsset";
import {
  interestTokenContractsByAddress,
  yieldTokenInfos,
} from "efi/interestToken/interestToken";
import {
  principalTokenInfos,
  trancheContractsByAddress,
} from "efi/tranche/tranches";
import { underlyingContractsByAddress } from "efi/underlying/underlying";
import keyBy from "lodash.keyby";

const WBTC_CRYPTO_ASSET: Erc20CryptoAsset = {
  id: AddressesJson.addresses.wbtcAddress,
  type: CryptoAssetType.ERC20,
  tokenContract: underlyingContractsByAddress[
    AddressesJson.addresses.wbtcAddress
  ] as ERC20,
};

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
  id: AddressesJson.addresses["lusd3crv-fAddress"],
  type: CryptoAssetType.ERC20,
  tokenContract: underlyingContractsByAddress[
    AddressesJson.addresses["lusd3crv-fAddress"]
  ] as ERC20,
};
const CRVMIM_CRYPTO_ASSET: Erc20CryptoAsset = {
  id: AddressesJson.addresses["mim-3lp3crv-fAddress"],
  type: CryptoAssetType.ERC20,
  tokenContract: underlyingContractsByAddress[
    AddressesJson.addresses["mim-3lp3crv-fAddress"]
  ] as ERC20,
};

const CRVALUSD_CRYPTO_ASSET: Erc20CryptoAsset = {
  id: AddressesJson.addresses["alusd3crv-fAddress"],
  type: CryptoAssetType.ERC20,
  tokenContract: underlyingContractsByAddress[
    AddressesJson.addresses["alusd3crv-fAddress"]
  ] as ERC20,
};

const CRVTRICRYPTO_CRYPTO_ASSET: Erc20CryptoAsset = {
  id: AddressesJson.addresses.crvtricryptoAddress,
  type: CryptoAssetType.ERC20,
  tokenContract: underlyingContractsByAddress[
    AddressesJson.addresses.crvtricryptoAddress
  ] as ERC20,
};
const CRV3CRYPTO_CRYPTO_ASSET: Erc20CryptoAsset = {
  id: AddressesJson.addresses.crv3cryptoAddress,
  type: CryptoAssetType.ERC20,
  tokenContract: underlyingContractsByAddress[
    AddressesJson.addresses.crv3cryptoAddress
  ] as ERC20,
};

const STECRV_CRYPTO_ASSET: Erc20CryptoAsset = {
  id: AddressesJson.addresses.stecrvAddress,
  type: CryptoAssetType.ERC20,
  tokenContract: underlyingContractsByAddress[
    AddressesJson.addresses.stecrvAddress
  ] as ERC20,
};

const CRVEURS_CRYPTO_ASSET: Erc20CryptoAsset = {
  id: AddressesJson.addresses.eurscrvAddress,
  type: CryptoAssetType.ERC20,
  tokenContract: underlyingContractsByAddress[
    AddressesJson.addresses.eurscrvAddress
  ] as ERC20,
};

const baseAssetCryptoAssets: Record<string, CryptoAsset> = {
  // weth should return eth wherever it's used, because the user should never
  // interact with weth
  [AddressesJson.addresses.wbtcAddress]: WBTC_CRYPTO_ASSET,
  [AddressesJson.addresses.usdcAddress]: USDC_CRYPTO_ASSET,
  [AddressesJson.addresses.daiAddress]: DAI_CRYPTO_ASSET,
  [AddressesJson.addresses.wethAddress]: ETHEREUM_CRYPTO_ASSET,
  [AddressesJson.addresses["lusd3crv-fAddress"]]: CRVLUSD_CRYPTO_ASSET,
  [AddressesJson.addresses["alusd3crv-fAddress"]]: CRVALUSD_CRYPTO_ASSET,
  [AddressesJson.addresses["mim-3lp3crv-fAddress"]]: CRVMIM_CRYPTO_ASSET,
  [AddressesJson.addresses.crvtricryptoAddress]: CRVTRICRYPTO_CRYPTO_ASSET,
  [AddressesJson.addresses.crv3cryptoAddress]: CRV3CRYPTO_CRYPTO_ASSET,
  [AddressesJson.addresses.stecrvAddress]: STECRV_CRYPTO_ASSET,
  [AddressesJson.addresses.eurscrvAddress]: CRVEURS_CRYPTO_ASSET,
};

const principalTokenCryptoAssets: Erc20PermitCryptoAsset[] =
  principalTokenInfos.map(({ address }) => ({
    id: address,
    // All of our principal tokens follow the erc20Permit token standard.
    type: CryptoAssetType.ERC20PERMIT,
    tokenContract: trancheContractsByAddress[address] as unknown as ERC20Permit,
  }));

const yieldTokenCryptoAssets: Erc20PermitCryptoAsset[] = yieldTokenInfos.map(
  ({ address }) => ({
    id: address,
    // All of our yield tokens follow the erc20Permit token standard.
    type: CryptoAssetType.ERC20PERMIT,
    tokenContract: interestTokenContractsByAddress[
      address
    ] as unknown as ERC20Permit,
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
