import { t } from "ttag";

import { useTrancheContracts } from "efi-ui/tranche/useTrancheContracts";
import { CryptoAsset, findTokenContract } from "efi/crypto/CryptoAsset";

interface TrancheAssetSymbols {
  /**
   * a short symbol like ptETH or ytUSDC
   */
  symbol: string | undefined;

  /**
   * a longer label like 'Principal Token ETH'
   */
  label: string | undefined;
}
export function useTrancheAssetSymbol(
  trancheAsset: CryptoAsset | undefined,
  baseAssetSymbol: string | undefined
): TrancheAssetSymbols {
  const trancheContracts = useTrancheContracts();
  const trancheAddresses = trancheContracts.map(({ address }) => address);

  const trancheAssetContract = findTokenContract(trancheAsset);
  const trancheAssetTokenType = trancheAddresses.includes(
    trancheAssetContract?.address ?? ""
  )
    ? "principal"
    : "yield";
  const label =
    trancheAssetTokenType === "principal"
      ? t`${baseAssetSymbol} Principal Token`
      : t`${baseAssetSymbol} Yield Token`;
  const symbol =
    trancheAssetTokenType === "principal"
      ? t`pt${baseAssetSymbol}`
      : t`yt${baseAssetSymbol}`;

  return { symbol, label };
}
