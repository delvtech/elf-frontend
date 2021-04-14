import { ERC20__factory } from "elf-contracts/types/factories/ERC20__factory";
import { ERC20Permit__factory } from "elf-contracts/types/factories/ERC20Permit__factory";

import { useSmartContractFromFactory } from "efi-ui/contracts/useSmartContractFromFactory/useSmartContractFromFactory";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { CryptoAssetWithMetadata } from "efi-ui/crypto/CryptoAssetWithMetadata";
import { CryptoIconSvg, findAssetIcon } from "efi-ui/crypto/CryptoIcon";
import ContractAddresses, {
  KNOWN_ERC20_TOKENS,
  KNOWN_ERC20PERMIT_TOKENS,
} from "efi/contracts/contractsJson";
import { CryptoAssetType } from "efi/crypto/CryptoAsset";
import { NUM_ETH_DECIMALS } from "efi/crypto/ethereum";

/**
 * Turns a token into its CryptoAsset equivalent.
 * NOTE: This will turn a WETH address into an Ethereum CryptoAsset.
 */
export function useCryptoAssetWithMetadata(
  tokenAddress: string | undefined,
  account?: string | null
): CryptoAssetWithMetadata | undefined {
  const erc20Contract = useSmartContractFromFactory(
    tokenAddress,
    ERC20__factory.connect
  );
  const erc20PermitContract = useSmartContractFromFactory(
    tokenAddress,
    ERC20Permit__factory.connect
  );

  const { data: name } = useSmartContractReadCall(erc20Contract, "name");
  const { data: symbol } = useSmartContractReadCall(erc20Contract, "symbol");
  const { data: decimals } = useSmartContractReadCall(
    erc20Contract,
    "decimals"
  );
  const { data: balanceOf } = useSmartContractReadCall(
    erc20Contract,
    "balanceOf",
    {
      callArgs: [account as string],
      enabled: !!account,
    }
  );

  if (!tokenAddress) {
    return;
  }

  // Turn weth into eth because it is special
  if (tokenAddress === ContractAddresses.wethAddress) {
    const cryptoAsset: CryptoAssetWithMetadata = {
      id: "ethereum",
      type: CryptoAssetType.ETHEREUM,
      tokenContract: undefined,
      name: "Ethereum",
      symbol: "ETH",
      decimals: NUM_ETH_DECIMALS,
      balanceOf,
      assetIcon: CryptoIconSvg.ETH,
    };
    return cryptoAsset;
  }

  // If it's a known erc20, make it so
  const assetIcon = findAssetIcon(symbol);
  if (erc20Contract && assetIcon && KNOWN_ERC20_TOKENS.includes(tokenAddress)) {
    const cryptoAsset: CryptoAssetWithMetadata = {
      id: tokenAddress,
      type: CryptoAssetType.ERC20,
      tokenContract: erc20Contract,
      name,
      symbol,
      decimals,
      balanceOf,
      assetIcon,
    };
    return cryptoAsset;
  }

  if (
    erc20PermitContract &&
    assetIcon &&
    KNOWN_ERC20PERMIT_TOKENS.includes(tokenAddress)
  ) {
    const cryptoAsset: CryptoAssetWithMetadata = {
      id: tokenAddress,
      type: CryptoAssetType.ERC20PERMIT,
      tokenContract: erc20PermitContract,
      name,
      symbol,
      decimals,
      balanceOf,
      assetIcon,
    };
    return cryptoAsset;
  }
}
