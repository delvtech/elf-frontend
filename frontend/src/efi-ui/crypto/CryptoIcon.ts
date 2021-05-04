import { EthIcon, TokenIcon, UsdcIcon, WethIcon } from "efi-ui/token/TokenIcon";
import ContractAddresses from "efi/addresses";
import { CryptoAsset, CryptoAssetType } from "efi/crypto/CryptoAsset";
import { CryptoSymbol } from "efi/crypto/CryptoSymbol";

const CryptoIconSvg: Record<string, TokenIcon> = {
  [ContractAddresses.usdcAddress]: UsdcIcon,
  [ContractAddresses.wethAddress]: WethIcon,
};
export function findAssetIcon2(
  cryptoAsset: CryptoAsset | undefined
): TokenIcon | undefined {
  if (!cryptoAsset) {
    return undefined;
  }
  if (cryptoAsset.type === CryptoAssetType.ETHEREUM) {
    return EthIcon;
  }
  return CryptoIconSvg[cryptoAsset.tokenContract.address];
}

/**
 * Lookup object to get the svg icon for a given symbol. NOTE: all keys are in
 * uppercase, so consumers might need to format in order to get the correct
 * icon.
 */
// TODO: type this better
const CryptoIconSvgOld: Record<CryptoSymbol, TokenIcon> = {
  ETH: EthIcon,
  USDC: UsdcIcon,
  WETH: WethIcon,
};

/**
 * @deprecated Looking up assets by their symbol is deprecated, use findAssetIcon2 instead
 */
export function findAssetIcon(
  symbol: string | undefined
): TokenIcon | undefined {
  if (!symbol) {
    return undefined;
  }
  const iconKey = symbol.toUpperCase() as CryptoSymbol;
  return CryptoIconSvgOld[iconKey];
}
