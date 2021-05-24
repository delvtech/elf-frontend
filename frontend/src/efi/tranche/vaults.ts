import { TestYVault__factory } from "elf-contracts/types/factories/TestYVault__factory";
import { TestYVault } from "elf-contracts/types/TestYVault";
import keyBy from "lodash.keyby";

import { getSmartContractFromRegistryMulti } from "efi/contracts/SmartContractsRegistry";
import { assetProxyTokenInfos } from "efi/tranche/positions";

const vaultContracts = getSmartContractFromRegistryMulti(
  assetProxyTokenInfos.map(({ extensions: { vault } }) => vault),
  TestYVault__factory.connect
) as TestYVault[];

export const vaultContractsByAddress = keyBy(
  vaultContracts,
  (vault) => vault.address
);
