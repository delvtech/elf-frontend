import { Tranche } from "elf-contracts/types/Tranche";

import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { getCryptoAssetForToken } from "efi/crypto/getCryptoAssetForToken";
import { CryptoAsset } from "efi/crypto/CryptoAsset";

export function useBaseAssetForTranche(
  tranche: Tranche | undefined
): CryptoAsset | undefined {
  const { data: underlying } = useSmartContractReadCall(tranche, "underlying");
  const cryptoAsset = getCryptoAssetForToken(underlying);
  return cryptoAsset;
}
