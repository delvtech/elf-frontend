import {
  CryptoAsset,
  CryptoAssetType,
  findTokenContract,
} from "efi/crypto/CryptoAsset";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { NUM_ETH_DECIMALS } from "efi/crypto/ethereum";
import { assertNever } from "efi/base/assertNever";

export function useCryptoDecimals(
  asset: CryptoAsset | undefined
): number | undefined {
  const tokenContract = asset ? findTokenContract(asset) : undefined;
  const { data: tokenDecimals } = useSmartContractReadCall(
    tokenContract,
    "decimals"
  );

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
