import { Tranche } from "elf-contracts-typechain/dist/types";
import uniqBy from "lodash.uniqby";
import { PrincipalTokenInfo } from "tokenlists/types";

import { CryptoAsset } from "efi/crypto/CryptoAsset";
import { CryptoAssets } from "efi/crypto/CryptoAssetRegistry";
import { getTokenInfo } from "efi/tokenlists";
import { useOpenTrancheContracts } from "efi-ui/tranche/useOpenTrancheContracts";

export function useOpenTrancheBaseAssets(): CryptoAsset[] {
  const openTrancheContracts = useOpenTrancheContracts();
  return getBaseAssetsForTranches(openTrancheContracts) as CryptoAsset[];
}

function getBaseAssetsForTranches(
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
