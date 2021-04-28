import zip from "lodash.zip";

import { getQueriesData } from "efi-ui/base/queryResults";
import { useTokenDecimalsMulti } from "efi-ui/token/hooks/useTokenDecimalsMulti";
import { assertNever } from "efi/base/assertNever";
import {
  CryptoAsset,
  CryptoAssetType,
  findTokenContract,
} from "efi/crypto/CryptoAsset";
import { NUM_ETH_DECIMALS } from "efi/ethereum";

export function useCryptoDecimalsMulti(
  assets: (CryptoAsset | undefined)[]
): (number | undefined)[] {
  const tokenContracts = assets.map((asset) =>
    asset ? findTokenContract(asset) : undefined
  );
  const decimalsResults = useTokenDecimalsMulti(tokenContracts);

  return zip(assets, getQueriesData(decimalsResults)).map(
    ([asset, decimals]) => {
      if (!asset) {
        return undefined;
      }

      const assetType = asset.type;
      switch (assetType) {
        case CryptoAssetType.ETHEREUM:
          return NUM_ETH_DECIMALS;
        case CryptoAssetType.ERC20:
        case CryptoAssetType.ERC20PERMIT:
          return decimals;
        default:
          assertNever(assetType);
          return undefined;
      }
    }
  );
}
