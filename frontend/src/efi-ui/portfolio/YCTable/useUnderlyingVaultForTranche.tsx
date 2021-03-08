import {
  ERC20,
  ERC20__factory,
  Tranche,
  YVaultAssetProxy__factory,
} from "elf-contracts/types";
import { getQueryData } from "efi-ui/base/queryResults";
import { useSmartContractFromFactory } from "efi-ui/contracts/useSmartContractFromFactory/useSmartContractFromFactory";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";

export function useUnderlyingVaultForTranche(
  tranche: Tranche | undefined
): ERC20 | undefined {
  // This property is still called "elf", but it points to the VaultAssetProxy
  const vaultAssetProxyAddress = useSmartContractReadCall(tranche, "elf");

  const yVaultAssetProxy = useSmartContractFromFactory(
    getQueryData(vaultAssetProxyAddress),
    // TODO: The vault asset proxy might not necessarily by a YVaultAssetProxy, so
    // we'll need to make a static object of well-known addresses and factory constructors.
    YVaultAssetProxy__factory.connect
  );

  // The VaultAssetProxy gives us the address to the underlying vault, eg: Yearn Vault
  const vaultAddressResult = useSmartContractReadCall(
    yVaultAssetProxy,
    "vault"
  );
  const vaultContract = useSmartContractFromFactory(
    getQueryData(vaultAddressResult),
    ERC20__factory.connect
  );
  return vaultContract;
}
