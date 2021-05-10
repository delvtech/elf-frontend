import { YVaultAssetProxy__factory } from "elf-contracts/types/factories/YVaultAssetProxy__factory";
import { BigNumber } from "ethers";

import { getQueryData } from "efi-ui/base/queryResults";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { useTrancheForPool } from "efi-ui/pools/useTrancheForPool/useTrancheForPool";
import { useTokenDecimals } from "efi-ui/token/hooks/useTokenDecimals";
import { getSmartContractFromRegistry } from "efi/contracts/SmartContractsRegistry";
import { PoolContract } from "efi/pools/PoolContract";

export function useAccumulatedInterestForTranche(
  pool: PoolContract | undefined
): BigNumber | undefined {
  const trancheContract = useTrancheForPool(pool);
  const { data: decimals } = useTokenDecimals(trancheContract);

  // this is the amount of underlying that has been deposited into the tranche.
  const { data: balanceOfUnderlying } = useSmartContractReadCall(
    trancheContract,
    "valueSupplied"
  );

  const vaultAssetProxyAddress = useSmartContractReadCall(
    trancheContract,
    "position"
  );
  const yVaultAssetProxy = getSmartContractFromRegistry(
    getQueryData(vaultAssetProxyAddress),
    // TODO: The vault asset proxy might not necessarily by a YVaultAssetProxy, so
    // we'll need to make a static object of well-known addresses and factory constructors.
    YVaultAssetProxy__factory.connect
  );

  // the wrapped position has shares of a yearn vault.  this returns the base asset value of the
  // shares that this tranche has.  the method is poorly named.
  const { data: valueOfSharesInUnderlying } = useSmartContractReadCall(
    yVaultAssetProxy,
    "balanceOfUnderlying",
    {
      enabled: !!trancheContract,
      callArgs: [trancheContract?.address as string],
    }
  );

  if (!valueOfSharesInUnderlying || !balanceOfUnderlying || !decimals) {
    return undefined;
  }

  return valueOfSharesInUnderlying.sub(balanceOfUnderlying);
}
