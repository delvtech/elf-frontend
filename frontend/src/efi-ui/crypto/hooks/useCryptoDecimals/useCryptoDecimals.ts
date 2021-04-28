import {
  CryptoAsset,
  CryptoAssetType,
  findTokenContract,
} from "efi/crypto/CryptoAsset";
import { NUM_ETH_DECIMALS } from "efi/ethereum";
import { assertNever } from "efi/base/assertNever";
import { useTokenDecimals } from "efi-ui/token/hooks/useTokenDecimals";

export function useCryptoDecimals(
  asset: CryptoAsset | undefined
): number | undefined {
  const tokenContract = asset ? findTokenContract(asset) : undefined;
  const { data: tokenDecimals } = useTokenDecimals(tokenContract);

  if (!asset) {
    return;
  }

  const assetType = asset.type;
  switch (assetType) {
    case CryptoAssetType.ETHEREUM:
      return NUM_ETH_DECIMALS;
    case CryptoAssetType.ERC20:
    case CryptoAssetType.ERC20PERMIT:
      return tokenDecimals;
    default:
      assertNever(assetType);
  }
}
