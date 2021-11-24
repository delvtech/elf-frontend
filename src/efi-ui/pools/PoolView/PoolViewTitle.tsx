import { ReactElement } from "react";
import { Helmet } from "react-helmet";

import { PrincipalTokenInfo, YieldTokenInfo } from "tokenlists/types";
import { t } from "ttag";

import { getCryptoAssetForToken } from "efi/crypto/getCryptoAssetForToken";
import { getCryptoSymbol } from "efi/crypto/getCryptoSymbol";
import { getPoolTokens } from "efi/pools/getPoolTokens";
import { PoolInfo } from "efi/pools/PoolInfo";
import { formatTermAssetShortSymbol } from "efi/tranche/format";

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

  return (
    <Helmet>
      <title>{t`${baseAssetSymbol} - ${termAssetSymbol} | Element`}</title>
    </Helmet>
  );
}
