import { Tranche } from "elf-contracts/types/Tranche";

import { getQueriesData } from "efi-ui/base/queryResults";
import { useCryptoAssetForTokenMulti } from "efi-ui/crypto/hooks/useCryptoAssetForTokenMulti";
import { CryptoAsset } from "efi/crypto/CryptoAsset";

import { useTrancheUnderlyingMulti } from "./useTrancheUnderlyingMulti";

export function useBaseAssetsForTranches(
  tranches: (Tranche | undefined)[]
): (CryptoAsset | undefined)[] {
  const underlyingResults = useTrancheUnderlyingMulti(tranches);
  const underlying = getQueriesData(underlyingResults);

  const cryptoAssets = useCryptoAssetForTokenMulti(underlying);
  return cryptoAssets;
}
