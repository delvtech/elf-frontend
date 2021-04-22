import { Tranche } from "elf-contracts/types/Tranche";

import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { useCryptoAssetForToken } from "efi-ui/crypto/hooks/useCryptoAssetForToken";
import { CryptoAsset } from "efi/crypto/CryptoAsset";

export function useBaseAssetForTranche(
  tranche: Tranche | undefined
): CryptoAsset | undefined {
  const { data: underlying } = useSmartContractReadCall(tranche, "underlying");
  const cryptoAsset = useCryptoAssetForToken(underlying);
  return cryptoAsset;
}
