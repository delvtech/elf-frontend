import {
  ERC20Permit__factory,
  ERC20__factory,
} from "@elementfi/core-typechain";
import {
  CryptoAsset,
  CryptoAssetType,
  Erc20CryptoAsset,
  Erc20PermitCryptoAsset,
} from "efi/crypto/CryptoAsset";
import { defaultProvider } from "efi/providers/providers";

const mainnet_lusd_address = "0x5f98805A4E8be255a32880FDeC7F6728C6568bA0";
const mainnet_lusd_contract = ERC20Permit__factory.connect(
  mainnet_lusd_address,
  defaultProvider
);
const LUSD_CRYPTO_ASSET: Erc20PermitCryptoAsset = {
  id: mainnet_lusd_address,
  type: CryptoAssetType.ERC20PERMIT,
  tokenContract: mainnet_lusd_contract,
};

const mainnet_usdt_address = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
const mainnet_usdt_contract = ERC20__factory.connect(
  mainnet_usdt_address,
  defaultProvider
);
const USDT_CRYPTO_ASSET: Erc20CryptoAsset = {
  id: mainnet_usdt_address,
  type: CryptoAssetType.ERC20,
  tokenContract: mainnet_usdt_contract,
};

const mainnet_3crv_address = "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490";
const mainnet_3crv_contract = ERC20__factory.connect(
  mainnet_3crv_address,
  defaultProvider
);
const THREECRV_CRYPTO_ASSET: Erc20CryptoAsset = {
  id: mainnet_3crv_address,
  type: CryptoAssetType.ERC20,
  tokenContract: mainnet_3crv_contract,
};

const mainnet_alusd_address = "0xBC6DA0FE9aD5f3b0d58160288917AA56653660E9";
const mainnet_alusd_contract = ERC20__factory.connect(
  mainnet_alusd_address,
  defaultProvider
);
const ALUSD_CRYPTO_ASSET: Erc20CryptoAsset = {
  id: mainnet_alusd_address,
  type: CryptoAssetType.ERC20,
  tokenContract: mainnet_alusd_contract,
};

const mainnet_mim_address = "0x99D8a9C45b2ecA8864373A26D1459e3Dff1e17F3";
const mainnet_mim_contract = ERC20__factory.connect(
  mainnet_mim_address,
  defaultProvider
);
const MIM_CRYPTO_ASSET: Erc20CryptoAsset = {
  id: mainnet_mim_address,
  type: CryptoAssetType.ERC20,
  tokenContract: mainnet_mim_contract,
};

const mainnet_steth_address = "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84";
const mainnet_steth_contract = ERC20__factory.connect(
  mainnet_steth_address,
  defaultProvider
);
const STETH_CRYPTO_ASSET: Erc20CryptoAsset = {
  id: mainnet_steth_address,
  type: CryptoAssetType.ERC20,
  tokenContract: mainnet_steth_contract,
};

const mainnet_eurs_address = "0xdB25f211AB05b1c97D595516F45794528a807ad8";
const mainnet_eurs_contract = ERC20__factory.connect(
  mainnet_eurs_address,
  defaultProvider
);
const EURS_CRYPTO_ASSET: Erc20CryptoAsset = {
  id: mainnet_eurs_address,
  type: CryptoAssetType.ERC20,
  tokenContract: mainnet_eurs_contract,
};

const mainnet_seur_address = "0xD71eCFF9342A5Ced620049e616c5035F1dB98620";
const mainnet_seur_contract = ERC20__factory.connect(
  mainnet_seur_address,
  defaultProvider
);
const SEUR_CRYPTO_ASSET: Erc20CryptoAsset = {
  id: mainnet_eurs_address,
  type: CryptoAssetType.ERC20,
  tokenContract: mainnet_seur_contract,
};

export const mainnetZappableAssets: Record<string, CryptoAsset> = {
  [mainnet_lusd_address]: LUSD_CRYPTO_ASSET,
  [mainnet_usdt_address]: USDT_CRYPTO_ASSET,
  [mainnet_3crv_address]: THREECRV_CRYPTO_ASSET,
  [mainnet_alusd_address]: ALUSD_CRYPTO_ASSET,
  [mainnet_mim_address]: MIM_CRYPTO_ASSET,
  [mainnet_steth_address]: STETH_CRYPTO_ASSET,
  [mainnet_eurs_address]: EURS_CRYPTO_ASSET,
  [mainnet_seur_address]: SEUR_CRYPTO_ASSET,
};
