import { ERC20__factory } from "elf-contracts/types/factories/ERC20__factory";
import { ERC20Permit__factory } from "elf-contracts/types/factories/ERC20Permit__factory";
import { Tranche } from "elf-contracts/types/Tranche";

import { getQueriesData } from "efi-ui/base/queryResults";
import { useSmartContractReadCalls } from "efi-ui/contracts/useSmartContractReadCalls/useSmartContractReadCalls";
import { useSmartContractsFromFactory } from "efi-ui/contracts/useSmartContractsFromFactory/useSmartContractsFromFactory";
import { CryptoAssetWithIcon } from "efi-ui/crypto/CryptoAssetWithIcon";
import { CryptoIconSvg, findAssetIcon } from "efi-ui/crypto/CryptoIcon";
import ContractAddresses, {
  KNOWN_ERC20_TOKENS,
  KNOWN_ERC20PERMIT_TOKENS,
} from "efi/contracts/contractsJson";
import { CryptoAssetType } from "efi/crypto/CryptoAsset";

export function useBaseAssetForTranche(
  tranches: (Tranche | undefined)[]
): (CryptoAssetWithIcon | undefined)[] {
  const underlyingResults = useSmartContractReadCalls(tranches, "underlying");
  const underlying = getQueriesData(underlyingResults);
  const erc20Contracts = useSmartContractsFromFactory(
    underlying,
    ERC20__factory.connect
  );
  const erc20SymbolResults = useSmartContractReadCalls(
    erc20Contracts,
    "symbol"
  );
  const erc20PermitContracts = useSmartContractsFromFactory(
    underlying,
    ERC20Permit__factory.connect
  );
  const erc20PermitSymbolResults = useSmartContractReadCalls(
    erc20PermitContracts,
    "symbol"
  );

  const erc20Symbols = getQueriesData(erc20SymbolResults);
  const erc20PermitSymbols = getQueriesData(erc20PermitSymbolResults);

  const assets = underlying.map((underlyingAddress, underlyingIndex) => {
    if (!underlyingAddress) {
      return undefined;
    }

    // Turn weth into eth because it is special
    if (underlyingAddress === ContractAddresses.wethAddress) {
      return makeEthereumCryptoAsset();
    }

    // If it's a known erc20, make it so
    const erc20Contract = erc20Contracts[underlyingIndex];
    const erc20Icon = findAssetIcon(erc20Symbols[underlyingIndex]);
    if (
      erc20Contract &&
      erc20Icon &&
      KNOWN_ERC20_TOKENS.includes(underlyingAddress)
    ) {
      const cryptoAsset: CryptoAssetWithIcon = {
        id: underlyingAddress,
        type: CryptoAssetType.ERC20,
        tokenContract: erc20Contract,
        assetIcon: erc20Icon,
      };
      return cryptoAsset;
    }

    // If it's a known erc20Permit, make it so
    const erc20PermitContract = erc20PermitContracts[underlyingIndex];
    const erc20PermitIcon = findAssetIcon(erc20PermitSymbols[underlyingIndex]);
    if (
      erc20PermitContract &&
      erc20PermitIcon &&
      KNOWN_ERC20PERMIT_TOKENS.includes(underlyingAddress)
    ) {
      const cryptoAsset: CryptoAssetWithIcon = {
        id: underlyingAddress,
        type: CryptoAssetType.ERC20PERMIT,
        tokenContract: erc20PermitContract,
        assetIcon: erc20PermitIcon,
      };
      return cryptoAsset;
    }

    return undefined;
  });
  return assets;
}

function makeEthereumCryptoAsset() {
  const cryptoAsset: CryptoAssetWithIcon = {
    id: "ethereum",
    type: CryptoAssetType.ETHEREUM,
    assetIcon: CryptoIconSvg.ETH,
  };
  return cryptoAsset;
}
