import { ReactElement } from "react";
import { Helmet } from "react-helmet";

import { t } from "ttag";

import { useCryptoAssetForToken } from "efi-ui/crypto/hooks/useCryptoAssetForToken";
import { useCryptoSymbol } from "efi-ui/crypto/hooks/useCryptoSymbol/useCryptoSymbol";
import { usePoolTokens } from "efi-ui/pools/usePoolTokens/usePoolTokens";
import { useTermAssetSymbol } from "efi-ui/tranche/useTermAssetSymbol";
import { parseSortedTokensForPool } from "efi/pools/parseSortedTokensForPool";
import { PoolContract } from "efi/pools/PoolContract";

interface PoolViewTitleProps {
  pool: PoolContract | undefined;
}
export function PoolViewTitle({ pool }: PoolViewTitleProps): ReactElement {
  const { data: [tokens] = [] } = usePoolTokens(pool);
  const { baseAssetContract, termAssetContract } = parseSortedTokensForPool(
    tokens
  );
  const baseAsset = useCryptoAssetForToken(baseAssetContract?.address);
  const baseAssetSymbol = useCryptoSymbol(baseAsset);
  const { symbol: termAssetSymbol } = useTermAssetSymbol(
    termAssetContract?.address,
    baseAssetSymbol
  );

  return (
    <Helmet>
      <title>{t`${baseAssetSymbol} - ${termAssetSymbol} | Element`}</title>
    </Helmet>
  );
}
