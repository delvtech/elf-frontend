import { ERC20 } from "elf-contracts/types/ERC20";
import zip from "lodash.zip";

import { useSmartContractReadCalls } from "efi-ui/contracts/useSmartContractReadCalls/useSmartContractReadCalls";
import { CryptoAssetWithIcon } from "efi-ui/crypto/CryptoAssetWithIcon";
import { AssetIcon, CryptoIconSvg } from "efi-ui/crypto/CryptoIcon";
import { EthIcon } from "efi-ui/ethereum/EthIcon";
import { useBaseAssetContracts } from "efi-ui/tranche/useBaseAssetContracts";
import { CryptoAssetType } from "efi/crypto/CryptoAsset";
import { CryptoSymbol } from "efi/crypto/CryptoSymbol";

const ethBaseAsset: CryptoAssetWithIcon = {
  id: "base-asset-eth",
  type: CryptoAssetType.ETHEREUM,
  assetIcon: EthIcon,
};

export function useBaseAssets() {
  const baseAssetContracts = useBaseAssetContracts();

  const baseAssetSymbolsResult = useSmartContractReadCalls(
    baseAssetContracts,
    "symbol"
  );
  const baseAssetSymbols = baseAssetSymbolsResult.map((result) => result.data);
  const assetIds = baseAssetSymbols.map((symbol) => {
    if (!symbol) {
      return undefined;
    }
    return `base-asset-${symbol}`;
  });
  const assetIcons = baseAssetSymbols.map((symbol) => {
    if (!symbol) {
      return undefined;
    }
    const iconKey = symbol.toUpperCase() as CryptoSymbol;
    return CryptoIconSvg[iconKey];
  });

  const erc20BaseAssets = zip(assetIds, baseAssetContracts, assetIcons)
    .filter((zippedValues): zippedValues is [string, ERC20, AssetIcon] =>
      zippedValues.every((value) => !!value)
    )
    .map(
      ([assetId, tokenContract, assetIcon]): CryptoAssetWithIcon => ({
        id: assetId,
        type: CryptoAssetType.ERC20,
        tokenContract,
        assetIcon,
      })
    );

  const baseAssets: CryptoAssetWithIcon[] = [ethBaseAsset, ...erc20BaseAssets];

  return baseAssets;
}
