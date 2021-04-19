import { ERC20__factory } from "elf-contracts/types/factories/ERC20__factory";
import { ERC20Permit__factory } from "elf-contracts/types/factories/ERC20Permit__factory";
import zip from "lodash.zip";

import { getQueriesData } from "efi-ui/base/queryResults";
import { useSmartContractsFromFactory } from "efi-ui/contracts/useSmartContractsFromFactory/useSmartContractsFromFactory";
import { CryptoAssetWithIcon } from "efi-ui/crypto/CryptoAssetWithIcon";
import { CryptoIconSvg, findAssetIcon } from "efi-ui/crypto/CryptoIcon";
import { useTokenSymbolMulti } from "efi-ui/token/hooks/useTokenSymbolMulti";
import ContractAddresses, {
  KNOWN_ERC20_TOKENS,
  KNOWN_ERC20PERMIT_TOKENS,
} from "efi/contracts/contractsJson";
import { CryptoAssetType } from "efi/crypto/CryptoAsset";

/**
 * Turns a list of tokens into a list of CryptoAsset equivalents.
 * NOTE: This will turn a WETH address into an Ethereum CryptoAsset.
 */
export function useCryptoAssetForTokenMulti(
  tokenAddresses: (string | undefined)[]
): (CryptoAssetWithIcon | undefined)[] {
  const erc20Contracts = useSmartContractsFromFactory(
    tokenAddresses,
    ERC20__factory.connect
  );
  const erc20SymbolResults = useTokenSymbolMulti(erc20Contracts);

  const erc20PermitContracts = useSmartContractsFromFactory(
    tokenAddresses,
    ERC20Permit__factory.connect
  );
  const erc20PermitSymbolResults = useTokenSymbolMulti(erc20PermitContracts);

  const cryptoAssetForTokenMulti = zip(
    tokenAddresses,
    erc20Contracts,
    getQueriesData(erc20SymbolResults),
    erc20PermitContracts,
    getQueriesData(erc20PermitSymbolResults)
  ).map(
    ([
      tokenAddress,
      erc20Contract,
      erc20Symbol,
      erc20PermitContract,
      erc20PermitSymbol,
    ]) => {
      if (!tokenAddress) {
        return undefined;
      }

      // Turn weth into eth because it is special
      if (tokenAddress === ContractAddresses.wethAddress) {
        const cryptoAsset: CryptoAssetWithIcon = {
          id: "ethereum",
          type: CryptoAssetType.ETHEREUM,
          assetIcon: CryptoIconSvg.ETH,
        };
        return cryptoAsset;
      }

      // If it's a known erc20, make it so
      const erc20Icon = findAssetIcon(erc20Symbol);
      if (
        erc20Contract &&
        erc20Icon &&
        KNOWN_ERC20_TOKENS.includes(tokenAddress)
      ) {
        const cryptoAsset: CryptoAssetWithIcon = {
          id: tokenAddress,
          type: CryptoAssetType.ERC20,
          tokenContract: erc20Contract,
          assetIcon: erc20Icon,
        };
        return cryptoAsset;
      }

      // If it's a known erc20Permit, make it so
      const erc20PermitIcon = findAssetIcon(erc20PermitSymbol);
      if (
        erc20PermitContract &&
        erc20PermitIcon &&
        KNOWN_ERC20PERMIT_TOKENS.includes(tokenAddress)
      ) {
        const cryptoAsset: CryptoAssetWithIcon = {
          id: tokenAddress,
          type: CryptoAssetType.ERC20PERMIT,
          tokenContract: erc20PermitContract,
          assetIcon: erc20PermitIcon,
        };
        return cryptoAsset;
      }

      return undefined;
    }
  );
  return cryptoAssetForTokenMulti;
}
