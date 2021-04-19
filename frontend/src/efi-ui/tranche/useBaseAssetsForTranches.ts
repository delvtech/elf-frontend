import { Tranche } from "elf-contracts/types/Tranche";

import { getQueriesData } from "efi-ui/base/queryResults";
import { CryptoAssetWithIcon } from "efi-ui/crypto/CryptoAssetWithIcon";
import { useCryptoAssetForTokenMulti } from "efi-ui/crypto/hooks/useCryptoAssetForTokenMulti";
import { useTrancheUnderlyingMulti } from "./useTrancheUnderlyingMulti";

export function useBaseAssetsForTranches(
  tranches: (Tranche | undefined)[]
): (CryptoAssetWithIcon | undefined)[] {
  const underlyingResults = useTrancheUnderlyingMulti(tranches);
  const underlying = getQueriesData(underlyingResults);

  const cryptoAssets = useCryptoAssetForTokenMulti(underlying);
  return cryptoAssets;
}
