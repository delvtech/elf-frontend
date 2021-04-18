import { ERC20__factory } from "elf-contracts/types/factories/ERC20__factory";
import { ERC20Permit__factory } from "elf-contracts/types/factories/ERC20Permit__factory";

import { useSmartContractFromFactory } from "efi-ui/contracts/useSmartContractFromFactory/useSmartContractFromFactory";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { CryptoAssetWithIcon } from "efi-ui/crypto/CryptoAssetWithIcon";
import { CryptoIconSvg, findAssetIcon } from "efi-ui/crypto/CryptoIcon";
import { useInterestTokenContracts } from "efi-ui/interestToken/useInterestTokens/useInterestTokens";
import { useTrancheContracts } from "efi-ui/tranche/useTrancheContracts";
import ContractAddresses, {
  KNOWN_ERC20_TOKENS,
  KNOWN_ERC20PERMIT_TOKENS,
} from "efi/contracts/contractsJson";
import { CryptoAssetType } from "efi/crypto/CryptoAsset";

/**
 * Turns a token into its CryptoAsset equivalent.
 * NOTE: This will turn a WETH address into an Ethereum CryptoAsset.
 */
export function useCryptoAssetForToken(
  tokenAddress: string | undefined
): CryptoAssetWithIcon | undefined {
  const trancheContracts = useTrancheContracts();
  const interestTokenContracts = useInterestTokenContracts();
  const elementTokenAddresses = [
    ...trancheContracts,
    ...interestTokenContracts,
  ].map(({ address }) => address);

  const erc20Contract = useSmartContractFromFactory(
    tokenAddress,
    ERC20__factory.connect
  );

  const erc20PermitContract = useSmartContractFromFactory(
    tokenAddress,
    ERC20Permit__factory.connect
  );

  const { data: symbol } = useSmartContractReadCall(erc20Contract, "symbol");

  if (!tokenAddress) {
    return;
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
  const assetIcon = findAssetIcon(symbol);
  if (erc20Contract && KNOWN_ERC20_TOKENS.includes(tokenAddress)) {
    const cryptoAsset: CryptoAssetWithIcon = {
      id: tokenAddress,
      type: CryptoAssetType.ERC20,
      tokenContract: erc20Contract,
      assetIcon,
    };
    return cryptoAsset;
  }

  const isERC20PermitAsset = [
    ...elementTokenAddresses,
    ...KNOWN_ERC20PERMIT_TOKENS,
  ].includes(tokenAddress);

  if (erc20PermitContract && isERC20PermitAsset) {
    const cryptoAsset: CryptoAssetWithIcon = {
      id: tokenAddress,
      type: CryptoAssetType.ERC20PERMIT,
      tokenContract: erc20PermitContract,
      assetIcon,
    };

    return cryptoAsset;
  }
}
