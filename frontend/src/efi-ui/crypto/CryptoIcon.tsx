import { Tag } from "@blueprintjs/core";
import {
  DaiIcon,
  EthIcon,
  IconProps,
  TokenIcon,
  UsdcIcon,
  WethIcon,
} from "efi-ui/token/TokenIcon";
import ContractAddresses from "efi/addresses";
import { CryptoAsset, CryptoAssetType } from "efi/crypto/CryptoAsset";
import { getCryptoSymbol2 } from "efi/crypto/getCryptoSymbol";
import { ReactElement } from "react";

const CryptoIconSvg: Record<string, TokenIcon> = {
  [ContractAddresses.usdcAddress]: UsdcIcon,
  [ContractAddresses.wethAddress]: WethIcon,
  [ContractAddresses.daiAddress]: DaiIcon,
};

/**
 * @deprecated signatures that take undefined are deprecated. use findAssetIcon2 instead.
 */
export function findAssetIcon(
  cryptoAsset: CryptoAsset | undefined
): TokenIcon | undefined {
  if (!cryptoAsset) {
    return undefined;
  }
  if (cryptoAsset.type === CryptoAssetType.ETHEREUM) {
    return EthIcon;
  }
  const iconSvg = CryptoIconSvg[cryptoAsset.tokenContract.address];
  if (iconSvg) {
    return iconSvg;
  }

  const tagIcon = makeTagIcon(cryptoAsset);
  return tagIcon;
}

function makeTagIcon(cryptoAsset: CryptoAsset) {
  return ({ height, width, style, className }: IconProps): ReactElement => {
    const symbol = getCryptoSymbol2(cryptoAsset);
    return (
      <Tag large minimal className={className} style={style}>
        {symbol}
      </Tag>
    );
  };
}

export function findAssetIcon2(cryptoAsset: CryptoAsset): TokenIcon {
  if (cryptoAsset.type === CryptoAssetType.ETHEREUM) {
    return EthIcon;
  }
  const iconSvg = CryptoIconSvg[cryptoAsset.tokenContract.address];
  if (iconSvg) {
    return iconSvg;
  }

  const tagIcon = makeTagIcon(cryptoAsset);
  return tagIcon;
}
