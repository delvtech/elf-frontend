import { getSmartContractFromRegistry } from "efi-ui/contracts/SmartContractsRegistry";
import ContractAddresses, {
  KNOWN_ERC20_TOKENS,
  KNOWN_ERC20PERMIT_TOKENS,
} from "efi/addresses";
import { CryptoAsset, CryptoAssetType } from "efi/crypto/CryptoAsset";
import { InterestTokenContracts, TrancheContracts } from "efi/tranche/tranches";
import { ERC20 } from "elf-contracts/types/ERC20";
import { ERC20Permit } from "elf-contracts/types/ERC20Permit";
import { ERC20Permit__factory } from "elf-contracts/types/factories/ERC20Permit__factory";
import { ERC20__factory } from "elf-contracts/types/factories/ERC20__factory";

/**
 * Turns a token into its CryptoAsset equivalent.
 * NOTE: This will turn a WETH address into an Ethereum CryptoAsset.
 */
export function useCryptoAssetForToken(
  tokenAddress: string | undefined
): CryptoAsset | undefined {
  // element tranches and interest tokens are known permits

  if (!tokenAddress) {
    return;
  }

  // Turn weth into eth because it is special
  if (tokenAddress === ContractAddresses.wethAddress) {
    const cryptoAsset: CryptoAsset = {
      id: "ethereum",
      type: CryptoAssetType.ETHEREUM,
    };
    return cryptoAsset;
  }

  // If it's a known erc20, make it so
  if (KNOWN_ERC20_TOKENS.includes(tokenAddress)) {
    const erc20Contract = getSmartContractFromRegistry(
      tokenAddress,
      ERC20__factory.connect
    ) as ERC20;
    const cryptoAsset: CryptoAsset = {
      id: tokenAddress,
      type: CryptoAssetType.ERC20,
      tokenContract: erc20Contract,
    };
    return cryptoAsset;
  }

  const isERC20PermitAsset = [
    ...TrancheContracts.map(({ address }) => address),
    ...InterestTokenContracts.map(({ address }) => address),
    ...KNOWN_ERC20PERMIT_TOKENS,
  ].includes(tokenAddress);

  if (isERC20PermitAsset) {
    const erc20PermitContract = getSmartContractFromRegistry(
      tokenAddress,
      ERC20Permit__factory.connect
    ) as ERC20Permit;
    const cryptoAsset: CryptoAsset = {
      id: tokenAddress,
      type: CryptoAssetType.ERC20PERMIT,
      tokenContract: erc20PermitContract,
    };

    return cryptoAsset;
  }
}
