import { ERC20__factory } from "elf-contracts/types/factories/ERC20__factory";
import { ERC20Permit__factory } from "elf-contracts/types/factories/ERC20Permit__factory";
import { Tranche } from "elf-contracts/types/Tranche";

import { useSmartContractFromFactory } from "efi-ui/contracts/useSmartContractFromFactory/useSmartContractFromFactory";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { CryptoAssetWithIcon } from "efi-ui/crypto/CryptoAssetWithIcon";
import { CryptoIconSvg, findAssetIcon } from "efi-ui/crypto/CryptoIcon";
import ContractAddresses, {
  KNOWN_ERC20_TOKENS,
  KNOWN_ERC20PERMIT_TOKENS,
} from "efi/contracts/contractsJson";
import { CryptoAssetType } from "efi/crypto/CryptoAsset";

export function useBaseAssetForTranche(
  tranche: Tranche | undefined
): CryptoAssetWithIcon | undefined {
  const { data: underlying } = useSmartContractReadCall(tranche, "underlying");
  const erc20Contract = useSmartContractFromFactory(
    underlying,
    ERC20__factory.connect
  );
  const { data: erc20Symbol } = useSmartContractReadCall(
    erc20Contract,
    "symbol"
  );
  const erc20PermitContract = useSmartContractFromFactory(
    underlying,
    ERC20Permit__factory.connect
  );
  const { data: erc20PermitSymbol } = useSmartContractReadCall(
    erc20PermitContract,
    "symbol"
  );

  if (!underlying) {
    return;
  }

  // Turn weth into eth because it is special
  if (underlying === ContractAddresses.wethAddress) {
    const cryptoAsset: CryptoAssetWithIcon = {
      id: "ethereum",
      type: CryptoAssetType.ETHEREUM,
      assetIcon: CryptoIconSvg.ETH,
    };
    return cryptoAsset;
  }

  // If it's a known erc20, make it so
  const erc20Icon = findAssetIcon(erc20Symbol);
  if (erc20Contract && erc20Icon && KNOWN_ERC20_TOKENS.includes(underlying)) {
    const cryptoAsset: CryptoAssetWithIcon = {
      id: underlying,
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
    KNOWN_ERC20PERMIT_TOKENS.includes(underlying)
  ) {
    const cryptoAsset: CryptoAssetWithIcon = {
      id: underlying,
      type: CryptoAssetType.ERC20PERMIT,
      tokenContract: erc20PermitContract,
      assetIcon: erc20PermitIcon,
    };
    return cryptoAsset;
  }
}
