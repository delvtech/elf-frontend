import { ERC20__factory } from "elf-contracts/types/factories/ERC20__factory";
import { ERC20Permit__factory } from "elf-contracts/types/factories/ERC20Permit__factory";
import zip from "lodash.zip";

import { getQueriesData } from "efi-ui/base/queryResults";
import { getSmartContractFromRegistryMulti } from "efi-ui/contracts/SmartContractsRegistry";
import { useTokenSymbolMulti } from "efi-ui/token/hooks/useTokenSymbolMulti";
import ContractAddresses, {
  KNOWN_ERC20_TOKENS,
  KNOWN_ERC20PERMIT_TOKENS,
} from "efi/contracts/contractsJson";
import { CryptoAsset, CryptoAssetType } from "efi/crypto/CryptoAsset";

/**
 * Turns a list of tokens into a list of CryptoAsset equivalents.
 * NOTE: This will turn a WETH address into an Ethereum CryptoAsset.
 */
export function useCryptoAssetForTokenMulti(
  tokenAddresses: (string | undefined)[]
): (CryptoAsset | undefined)[] {
  // TODO: there might be a bug here with the registry putting the wrong type of contract in.
  // should get fixed with tokenlists though
  const erc20Contracts = getSmartContractFromRegistryMulti(
    tokenAddresses,
    ERC20__factory.connect
  );
  const erc20SymbolResults = useTokenSymbolMulti(erc20Contracts);

  const erc20PermitContracts = getSmartContractFromRegistryMulti(
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
        const cryptoAsset: CryptoAsset = {
          id: "ethereum",
          type: CryptoAssetType.ETHEREUM,
        };
        return cryptoAsset;
      }

      if (erc20Contract && KNOWN_ERC20_TOKENS.includes(tokenAddress)) {
        const cryptoAsset: CryptoAsset = {
          id: tokenAddress,
          type: CryptoAssetType.ERC20,
          tokenContract: erc20Contract,
        };
        return cryptoAsset;
      }

      // If it's a known erc20Permit, make it so
      if (
        erc20PermitContract &&
        KNOWN_ERC20PERMIT_TOKENS.includes(tokenAddress)
      ) {
        const cryptoAsset: CryptoAsset = {
          id: tokenAddress,
          type: CryptoAssetType.ERC20PERMIT,
          tokenContract: erc20PermitContract,
        };
        return cryptoAsset;
      }

      return undefined;
    }
  );
  return cryptoAssetForTokenMulti;
}
