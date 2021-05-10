import { Provider } from "@ethersproject/providers";
import { ERC20 } from "elf-contracts/types/ERC20";
import { ERC20__factory } from "elf-contracts/types/factories/ERC20__factory";
import { Signer } from "ethers";

import { getQueryData } from "efi-ui/base/queryResults";
import { usePoolTokens } from "efi-ui/pools/usePoolTokens/usePoolTokens";
import { KNOWN_BASE_ASSETS } from "efi/addresses";
import { getSmartContractFromRegistry } from "efi/contracts/SmartContractsRegistry";
import { PoolContract } from "efi/pools/PoolContract";
import { defaultProvider } from "efi/providers/providers";

export function useBaseAssetForPool(
  pool: PoolContract | undefined,
  signerOrProvider?: Signer | Provider
): ERC20 | undefined {
  const poolTokensResult = usePoolTokens(pool);
  const tokenAddresses = getQueryData(poolTokensResult)?.[0] || [];
  const baseAssetAddress = tokenAddresses.find((address) =>
    KNOWN_BASE_ASSETS.includes(address)
  );

  if (!baseAssetAddress) {
    return;
  }

  const baseAssetContract = getSmartContractFromRegistry(
    baseAssetAddress,
    ERC20__factory.connect,
    signerOrProvider || defaultProvider
  );

  return baseAssetContract;
}
