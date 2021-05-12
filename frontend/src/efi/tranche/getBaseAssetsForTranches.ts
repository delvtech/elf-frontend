import { Tranche } from "elf-contracts/types/Tranche";
import uniqBy from "lodash.uniqby";
import { PrincipalTokenInfo } from "tokenlists/types";

import { CryptoAsset } from "efi/crypto/CryptoAsset";
import { CryptoAssets } from "efi/crypto/CryptoAssetRegistry";
import { getTokenInfo } from "efi/tokenlists";

export function getBaseAssetsForTranches(
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

  // De-dupe since multiple tranches can have the same base asset
  const uniqueCryptoAssets = uniqBy(
    cryptoAssets.filter((v) => !!v),
    (v) => v?.id
  );

  return uniqueCryptoAssets;
}
