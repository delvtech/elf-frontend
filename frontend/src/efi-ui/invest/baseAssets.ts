import { CryptoAssetWithIcon } from "efi-ui/crypto/CryptoAssetWithIcon";
import { ReactComponent as UsdcIcon } from "efi-static-assets/logos/svg/USDC.svg";
import { EthIcon } from "efi-ui/ethereum/EthIcon";
import { CryptoAssetType } from "efi/crypto/CryptoAsset";
import { usdcContract } from "efi/crypto/TokenContracts";

export const baseAssets: CryptoAssetWithIcon[] = [
  {
    id: "base-asset-eth",
    type: CryptoAssetType.ETHEREUM,
    assetIcon: EthIcon,
  },

  {
    id: "base-asset-usdc",
    type: CryptoAssetType.ERC20,
    assetIcon: UsdcIcon,
    tokenContract: usdcContract,
  },
];
