import { Tranche } from "elf-contracts/types/Tranche";

import { getQueriesData } from "efi-ui/base/queryResults";
import { useSmartContractReadCalls } from "efi-ui/contracts/useSmartContractReadCalls/useSmartContractReadCalls";
import { CryptoAssetWithIcon } from "efi-ui/crypto/CryptoAssetWithIcon";
import { useCryptoAssetForTokenMulti } from "efi-ui/crypto/hooks/useCryptoAssetForTokenMulti";

export function useBaseAssetsForTranches(
  tranches: (Tranche | undefined)[]
): (CryptoAssetWithIcon | undefined)[] {
  const underlyingResults = useSmartContractReadCalls(tranches, "underlying");
  const underlying = getQueriesData(underlyingResults);

  const cryptoAssets = useCryptoAssetForTokenMulti(underlying);
  return cryptoAssets;
}
