import { ERC20 } from "elf-contracts/types/ERC20";
import zip from "lodash.zip";

import { useSmartContractReadCalls } from "efi-ui/contracts/useSmartContractReadCalls/useSmartContractReadCalls";
import { CryptoAssetWithIcon } from "efi-ui/crypto/CryptoAssetWithIcon";
import { AssetIcon, CryptoIconSvg } from "efi-ui/crypto/CryptoIcon";
import { EthIcon } from "efi-ui/ethereum/EthIcon";
import { useBaseAssetContracts } from "efi-ui/invest/hooks/useBaseAssetContracts";
import { CryptoAssetType } from "efi/crypto/CryptoAsset";
import { CryptoSymbol } from "efi/crypto/CryptoSymbol";
import { getQueriesData } from "efi-ui/base/queryResults";

const ethBaseAsset: CryptoAssetWithIcon = {
  id: "base-asset-eth",
  type: CryptoAssetType.ETHEREUM,
  assetIcon: EthIcon,
};

export function useBaseAssets(): CryptoAssetWithIcon[] {
  const baseAssetContracts = useBaseAssetContracts();

  const baseAssetSymbolResults = useSmartContractReadCalls(
    baseAssetContracts,
    "symbol"
  );
  const baseAssetSymbols = getQueriesData(baseAssetSymbolResults);
  const assetIds = formatAssetId(baseAssetSymbols);
  const assetIcons = formatAssetIcon(baseAssetSymbols);

  const erc20BaseAssets = zip(assetIds, baseAssetContracts, assetIcons)
    .filter((zippedValues): zippedValues is [string, ERC20, AssetIcon] =>
      zippedValues.every((value) => !!value)
    )
    .map(
      ([assetId, tokenContract, assetIcon]): CryptoAssetWithIcon => {
        return {
          id: assetId,
          type: CryptoAssetType.ERC20,
          tokenContract,
          assetIcon,
        };
      }
    );

  const baseAssets: CryptoAssetWithIcon[] = [ethBaseAsset, ...erc20BaseAssets];

  return baseAssets;
}
function formatAssetIcon(baseAssetSymbols: (string | undefined)[]) {
  return baseAssetSymbols.map((symbol) => {
    if (!symbol) {
      return undefined;
    }
    const iconKey = symbol.toUpperCase() as CryptoSymbol;
    return CryptoIconSvg[iconKey];
  });
}

function formatAssetId(baseAssetSymbols: (string | undefined)[]) {
  return baseAssetSymbols.map((symbol) => {
    if (!symbol) {
      return undefined;
    }
    return `base-asset-${symbol}`;
  });
}
