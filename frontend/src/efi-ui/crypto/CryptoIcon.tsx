import React, { ReactElement } from "react";

import { Tag } from "@blueprintjs/core";

import {
  CrvAlusdIcon,
  CrvLusdIcon,
  CrvStethIcon,
  CrvTricryptoIcon,
  DaiIcon,
  EthIcon,
  IconProps,
  TokenIcon,
  UsdcIcon,
  WethIcon,
  WbtcIcon,
} from "efi-ui/token/TokenIcon";
import ContractAddresses from "efi/addresses";
import { CryptoAsset, CryptoAssetType } from "efi/crypto/CryptoAsset";
import { getCryptoSymbol } from "efi/crypto/getCryptoSymbol";

const CryptoIconSvg: Record<string, TokenIcon> = {
  [ContractAddresses.usdcAddress]: UsdcIcon,
  [ContractAddresses.wethAddress]: WethIcon,
  [ContractAddresses.daiAddress]: DaiIcon,
  [ContractAddresses["lusd3crv-fAddress"]]: CrvLusdIcon,
  [ContractAddresses.crvalusdAddress]: CrvAlusdIcon,
  [ContractAddresses.crvtricryptoAddress]: CrvTricryptoIcon,
  [ContractAddresses.crv3cryptoAddress]: CrvTricryptoIcon,
  [ContractAddresses.stecrvAddress]: CrvStethIcon,
  [ContractAddresses.wbtcAddress]: WbtcIcon,
};

function makeTagIcon(cryptoAsset: CryptoAsset) {
  return ({ style, className }: IconProps): ReactElement => {
    const symbol = getCryptoSymbol(cryptoAsset);
    return (
      <Tag large minimal className={className} style={style}>
        {symbol}
      </Tag>
    );
  };
}

export function findAssetIcon(cryptoAsset: CryptoAsset): TokenIcon {
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
