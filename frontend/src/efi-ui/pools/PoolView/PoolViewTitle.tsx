import { ReactElement } from "react";
import { Helmet } from "react-helmet";

import { t } from "ttag";

import { getTermAssetSymbol } from "efi-ui/tranche/getTermAssetSymbol";
import { getCryptoAssetForToken } from "efi/crypto/getCryptoAssetForToken";
import { getCryptoSymbol } from "efi/crypto/getCryptoSymbol";
import { getPoolTokens } from "efi/pools/getPoolTokens";
import { PoolInfo } from "efi/pools/PoolInfo";
import { getVaultSymbol } from "efi/vaults/getVaultSymbol";

interface PoolViewTitleProps {
  poolInfo: PoolInfo;
}
export function PoolViewTitle({ poolInfo }: PoolViewTitleProps): ReactElement {
  const { baseAssetInfo, termAssetInfo } = getPoolTokens(poolInfo);
  const baseCryptoAsset = getCryptoAssetForToken(baseAssetInfo.address);
  const baseAssetSymbol = getCryptoSymbol(baseCryptoAsset);
  const vaultSymbol = getVaultSymbol(baseCryptoAsset);
  const { symbol: termAssetSymbol } = getTermAssetSymbol(
    termAssetInfo.address,
    vaultSymbol
  );

  return (
    <Helmet>
      <title>{t`${baseAssetSymbol} - ${termAssetSymbol} | Element`}</title>
    </Helmet>
  );
}
