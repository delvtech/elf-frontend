import { ERC20__factory } from "elf-contracts/types/factories/ERC20__factory";
import { ERC20Permit__factory } from "elf-contracts/types/factories/ERC20Permit__factory";

import { useSmartContractFromFactory } from "efi-ui/contracts/useSmartContractFromFactory/useSmartContractFromFactory";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { CryptoAssetWithIcon } from "efi-ui/crypto/CryptoAssetWithIcon";
import { CryptoIconSvg, findAssetIcon } from "efi-ui/crypto/CryptoIcon";
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
  const erc20Contract = useSmartContractFromFactory(
    tokenAddress,
    ERC20__factory.connect
  );
  const { data: erc20Symbol } = useSmartContractReadCall(
    erc20Contract,
    "symbol"
  );
  const erc20PermitContract = useSmartContractFromFactory(
    tokenAddress,
    ERC20Permit__factory.connect
  );
  const { data: erc20PermitSymbol } = useSmartContractReadCall(
    erc20PermitContract,
    "symbol"
  );

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
  const erc20Icon = findAssetIcon(erc20Symbol);
  if (erc20Contract && erc20Icon && KNOWN_ERC20_TOKENS.includes(tokenAddress)) {
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
}
