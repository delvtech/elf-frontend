import { Tranche } from "elf-contracts/types/Tranche";

import { CryptoAsset } from "efi/crypto/CryptoAsset";
import { CryptoAssets } from "efi/crypto/CryptoAssetRegistry";
import { getTokenInfo, PrincipalTokenInfo } from "efi/tokenlists";

export function getUnderlyingCryptoAssetsForTranches(
  tranches: (Tranche | undefined)[]
): (CryptoAsset | undefined)[] {
  const cryptoAssets = tranches.map((tranche) => {
    if (!tranche?.address) {
      return undefined;
    }
    const {
      extensions: { underlying },
    } = getTokenInfo<PrincipalTokenInfo>(tranche.address);
    return CryptoAssets[underlying];
  });

  return cryptoAssets;
}
