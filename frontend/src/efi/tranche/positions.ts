import { getSmartContractFromRegistry } from "efi/contracts/SmartContractsRegistry";
import { getTokenInfo } from "efi/tokenlists";
import { TestYVault__factory } from "elf-contracts/types/factories/TestYVault__factory";
import { TestYVault } from "elf-contracts/types/TestYVault";
import { PrincipalTokenInfo, AssetProxyTokenInfo } from "tokenlists/types";

export function getVaultForTranche(trancheAddress: string): TestYVault {
  const {
    extensions: { position },
  } = getTokenInfo<PrincipalTokenInfo>(trancheAddress);

  const {
    extensions: { vault },
  } = getTokenInfo<AssetProxyTokenInfo>(position);

  const vaultContract = getSmartContractFromRegistry(
    vault,
    TestYVault__factory.connect
  ) as TestYVault;

  return vaultContract;
}
