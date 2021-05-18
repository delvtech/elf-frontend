import zip from "lodash.zip";

import { getQueriesData } from "efi-ui/base/queryResults";
import { useTokenSymbolMulti } from "efi-ui/token/hooks/useTokenSymbolMulti";
import { assertNever } from "efi/base/assertNever";
import {
  CryptoAsset,
  CryptoAssetType,
  findTokenContract,
} from "efi/crypto/CryptoAsset";

/**
 * @deprecated hooks based lookups for crypto symbols are depreacted. use getCryptoSymbol instead.
 */
export function useCryptoSymbolMulti(
  assets: (CryptoAsset | undefined)[]
): (string | undefined)[] {
  const tokenContracts = assets.map((asset) =>
    asset ? findTokenContract(asset) : undefined
  );
  const tokenSymbolResults = useTokenSymbolMulti(tokenContracts);

  return zip(assets, getQueriesData(tokenSymbolResults)).map(
    ([asset, tokenSymbol]) => {
      if (!asset) {
        return undefined;
      }

      const assetType = asset.type;
      switch (assetType) {
        case CryptoAssetType.ETHEREUM:
          return "ETH";
        case CryptoAssetType.ERC20:
        case CryptoAssetType.ERC20PERMIT:
          return tokenSymbol;
        default:
          assertNever(assetType);
          return undefined;
      }
    }
  );
}
