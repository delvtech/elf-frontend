import { ERC20 } from "elf-contracts/types/ERC20";
import { YVaultAssetProxy__factory } from "elf-contracts/types/factories/YVaultAssetProxy__factory";
import { Tranche } from "elf-contracts/types/Tranche";
import { YVaultAssetProxy } from "elf-contracts/types/YVaultAssetProxy";
import { formatUnits } from "ethers/lib/utils";

import { getQueryData } from "efi-ui/base/queryResults";
import { useSmartContractFromFactory } from "efi-ui/contracts/useSmartContractFromFactory/useSmartContractFromFactory";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { useTokenDecimals } from "efi-ui/token/hooks/useTokenDecimals";
import { useUnderlyingVaultForTranche } from "efi-ui/tranche/useUnderlyingVaultForTranche";

/**
 * Returns the number of Principal Tokens you'd get for minting into a tranche.
 * This is useful because in order to mint into a tranche, some amount of
 * principal must be used to cover the current earnings of the YT. This results
 * in less than 1 to 1 principal tokens for your deposit.
 */
export function useMintPreview(
  tranche: Tranche | undefined,
  amountIn: number | undefined
): number | undefined {
  const wrappedPosition = useWrappedPositionForTranche(tranche);
  const vault = useUnderlyingVaultForTranche(tranche);

  const { data: trancheDecimals } = useTokenDecimals(tranche);
  const { data: wrappedPositionDecimals } = useTokenDecimals(
    (wrappedPosition as unknown) as ERC20
  );
  const { data: vaultDecimals } = useTokenDecimals((vault as unknown) as ERC20);

  const { data: trancheValueSuppliedBN } = useSmartContractReadCall(
    tranche,
    "valueSupplied"
  );
  const { data: trancheInterestSupplyBN } = useSmartContractReadCall(
    tranche,
    "interestSupply"
  );

  const { data: balanceBeforeBN } = useSmartContractReadCall(
    wrappedPosition,
    "balanceOf",
    {
      callArgs: [tranche?.address as string],
    }
  );

  // our stub doesn't have this yet so don't make the call so we don't bork trying to call a method
  // that doesn't exist
  const { data: vaultTotalAssetsBN } = useSmartContractReadCall(
    vault,
    "totalAssets"
  );

  const { data: vaultTotalSupplyBN } = useSmartContractReadCall(
    vault,
    "totalSupply"
  );

  if (
    !amountIn ||
    !trancheValueSuppliedBN ||
    !trancheInterestSupplyBN ||
    !balanceBeforeBN ||
    !vaultTotalAssetsBN ||
    !vaultTotalSupplyBN ||
    !trancheDecimals ||
    !wrappedPositionDecimals
  ) {
    return undefined;
  }

  const trancheValueSupplied = +formatUnits(
    trancheValueSuppliedBN,
    trancheDecimals
  );
  const trancheInterestSupply = +formatUnits(
    trancheInterestSupplyBN,
    trancheDecimals
  );
  const balanceBefore = +formatUnits(balanceBeforeBN, wrappedPositionDecimals);
  const vaultTotalAssets = +formatUnits(vaultTotalAssetsBN, vaultDecimals);
  const vaultTotalSupply = +formatUnits(vaultTotalSupplyBN, vaultDecimals);

  const interestPerUnderlying =
    ((balanceBefore * vaultTotalAssets) / vaultTotalSupply -
      trancheValueSupplied) /
    trancheInterestSupply;

  const adjustedAmount = amountIn - amountIn * interestPerUnderlying;
  return adjustedAmount;
}

function useWrappedPositionForTranche(
  tranche: Tranche | undefined
): YVaultAssetProxy | undefined {
  const vaultAssetProxyAddress = useSmartContractReadCall(tranche, "position");

  const yVaultAssetProxy = useSmartContractFromFactory(
    getQueryData(vaultAssetProxyAddress),
    // TODO: The vault asset proxy might not necessarily by a YVaultAssetProxy, so
    // we'll need to make a static object of well-known addresses and factory constructors.
    YVaultAssetProxy__factory.connect
  );

  return yVaultAssetProxy;
}
