import { AddressesJson } from "efi/addresses";
import { getSmartContractFromRegistry } from "efi/contracts/SmartContractsRegistry";
import {
  CryptoAsset,
  CryptoAssetType,
  Erc20PermitCryptoAsset,
  ETHEREUM_CRYPTO_ASSET,
} from "efi/crypto/CryptoAsset";
import { YieldTokenInfos } from "efi/interestToken/interestToken";
import { PrincipalTokenInfos } from "efi/tranche/tranches";
import { InterestToken__factory } from "elf-contracts/types/factories/InterestToken__factory";
import { Tranche__factory } from "elf-contracts/types/factories/Tranche__factory";
import { InterestToken } from "elf-contracts/types/InterestToken";
import { Tranche } from "elf-contracts/types/Tranche";
import keyBy from "lodash.keyby";

const USDC_CRYPTO_ASSET: Erc20PermitCryptoAsset = {
  id: AddressesJson.addresses.usdcAddress,
  type: CryptoAssetType.ERC20PERMIT,
  tokenContract: getSmartContractFromRegistry(
    AddressesJson.addresses.usdcAddress,
    InterestToken__factory.connect
  ) as InterestToken,
};

const baseAssetCryptoAssets: Record<string, CryptoAsset> = {
  // weth should return eth wherever it's used, because the user should never
  // interact with weth
  [AddressesJson.addresses.wethAddress]: ETHEREUM_CRYPTO_ASSET,
  [AddressesJson.addresses.usdcAddress]: USDC_CRYPTO_ASSET,
};
export const BASE_ASSET_CRYPTO_ASSETS: CryptoAsset[] = Object.values(
  baseAssetCryptoAssets
);

const principalTokenCryptoAssets: Erc20PermitCryptoAsset[] =
  PrincipalTokenInfos.map(({ address }) => ({
    id: address,
    type: CryptoAssetType.ERC20PERMIT,
    tokenContract: getSmartContractFromRegistry(
      address,
      Tranche__factory.connect
    ) as Tranche,
  }));
const yieldTokenCryptoAssets: Erc20PermitCryptoAsset[] = YieldTokenInfos.map(
  ({ address }) => ({
    id: address,
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
