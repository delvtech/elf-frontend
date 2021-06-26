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
import React, { ReactElement } from "react";

const CryptoIconSvg: Record<string, TokenIcon> = {
  [ContractAddresses.usdcAddress]: UsdcIcon,
  [ContractAddresses.wethAddress]: WethIcon,
  [ContractAddresses.daiAddress]: DaiIcon,
};

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

export function findAssetIcon(cryptoAsset: CryptoAsset): React.FC<IconProps> {
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
