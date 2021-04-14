import { Tranche } from "elf-contracts/types/Tranche";

import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { CryptoAssetWithIcon } from "efi-ui/crypto/CryptoAssetWithIcon";
import { useCryptoAssetForToken } from "efi-ui/crypto/hooks/useCryptoAssetForToken";

export function useBaseAssetForTranche(
  tranche: Tranche | undefined
): CryptoAssetWithIcon | undefined {
  const { data: underlying } = useSmartContractReadCall(tranche, "underlying");
  const cryptoAsset = useCryptoAssetForToken(underlying);
  return cryptoAsset;
}
