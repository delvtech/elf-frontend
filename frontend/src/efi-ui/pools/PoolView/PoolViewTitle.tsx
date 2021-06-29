import { ReactElement } from "react";
import { Helmet } from "react-helmet";

import { t } from "ttag";

import { getTermAssetSymbol } from "efi/tranche/getTermAssetSymbol";
import { getCryptoAssetForToken } from "efi/crypto/getCryptoAssetForToken";
import { getCryptoSymbol } from "efi/crypto/getCryptoSymbol";
import { getPoolTokens } from "efi/pools/getPoolTokens";
import { PoolInfo } from "efi/pools/PoolInfo";
import {
  getVaultTokenInfoForTranche,
  isPrincipalToken,
} from "efi/tranche/tranches";
import { getPrincipalTokenForYieldToken } from "efi/tranche/yieldTokens";

interface PoolViewTitleProps {
  poolInfo: PoolInfo;
}
export function PoolViewTitle({ poolInfo }: PoolViewTitleProps): ReactElement {
  const { baseAssetInfo, termAssetInfo } = getPoolTokens(poolInfo);
  const baseCryptoAsset = getCryptoAssetForToken(baseAssetInfo.address);
  const baseAssetSymbol = getCryptoSymbol(baseCryptoAsset);

  const { address: trancheAddress } = isPrincipalToken(termAssetInfo)
    ? termAssetInfo
    : getPrincipalTokenForYieldToken(termAssetInfo.address);

  const { symbol: vaultSymbol } = getVaultTokenInfoForTranche(trancheAddress);
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
