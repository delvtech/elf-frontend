import { ReactElement } from "react";

import { t } from "ttag";

import { Title } from "efi-ui/base/Title";
import { getCryptoAssetForToken } from "efi/crypto/getCryptoAssetForToken";
import { getCryptoSymbol } from "efi/crypto/getCryptoSymbol";
import { getPoolTokens } from "efi/pools/getPoolTokens";
import { PoolInfo } from "efi/pools/PoolInfo";
import { formatTermAssetShortSymbol } from "efi/tranche/format";
import { PrincipalTokenInfo, YieldTokenInfo } from "@elementfi/tokenlist";

interface PoolViewTitleProps {
  poolInfo: PoolInfo;
}
export function PoolViewTitle({ poolInfo }: PoolViewTitleProps): ReactElement {
  const { baseAssetInfo, termAssetInfo } = getPoolTokens(poolInfo);
  const baseCryptoAsset = getCryptoAssetForToken(baseAssetInfo.address);
  const baseAssetSymbol = getCryptoSymbol(baseCryptoAsset);

  const termAssetSymbol = formatTermAssetShortSymbol(
    termAssetInfo as PrincipalTokenInfo | YieldTokenInfo
  );

  return <Title text={t`${baseAssetSymbol} - ${termAssetSymbol} | Element`} />;
}
