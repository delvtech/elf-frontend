import { ERC20 } from "elf-contracts/types/ERC20";
import { YVaultAssetProxy__factory } from "elf-contracts/types/factories/YVaultAssetProxy__factory";
import { YVaultAssetProxy } from "elf-contracts/types/YVaultAssetProxy";
import { formatUnits } from "ethers/lib/utils";
import { PrincipalTokenInfo as TrancheInfo } from "tokenlists/types";

import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { useTokenDecimals } from "efi-ui/token/hooks/useTokenDecimals";
import { getSmartContractFromRegistry } from "efi/contracts/SmartContractsRegistry";
import {
  getVaultForTranche,
  trancheContractsByAddress,
} from "efi/tranche/tranches";
import { TestYVault, Tranche } from "elf-contracts/types";

/**
 * Returns the number of Principal Tokens you'd get for minting into a tranche.
 * This is useful because in order to mint into a tranche, some amount of
 * principal must be used to cover the current earnings of the YT. This results
 * in less than 1 to 1 principal tokens for your deposit.
 */
export function useMintPreview(
  trancheInfo: TrancheInfo,
  amountIn: number
): number | undefined {
  const trancheContract = trancheContractsByAddress[trancheInfo.address];

  const { wrappedPosition, vault, trancheDecimals } =
    getStaticInformation(trancheInfo);

  const {
    wrappedPositionDecimals,
    vaultDecimals,
    trancheValueSuppliedBN,
    trancheInterestSupplyBN,
    balanceBeforeBN,
    vaultTotalAssetsBN,
    vaultTotalSupplyBN,
  } = useSmartContractData(trancheContract, wrappedPosition, vault);

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

function getWrappedPositionForTranche(
  trancheInfo: TrancheInfo
): YVaultAssetProxy {
  const { position: vaultAssetProxyAddress } = trancheInfo.extensions;

  const yVaultAssetProxy = getSmartContractFromRegistry(
    vaultAssetProxyAddress,
    // TODO: The vault asset proxy might not necessarily by a YVaultAssetProxy, so
    // we'll need to make a static object of well-known addresses and factory constructors.
    YVaultAssetProxy__factory.connect
  ) as YVaultAssetProxy;

  return yVaultAssetProxy;
}

function getStaticInformation(trancheInfo: TrancheInfo) {
  const wrappedPosition = getWrappedPositionForTranche(trancheInfo);
  const vault = getVaultForTranche(trancheInfo.address);
  const { decimals: trancheDecimals } = trancheInfo;

  return {
    wrappedPosition,
    vault,
    trancheDecimals,
  };
}

function useSmartContractData(
  trancheContract: Tranche,
  wrappedPosition: YVaultAssetProxy,
  vault: TestYVault
) {
  const { data: wrappedPositionDecimals } = useTokenDecimals(
    wrappedPosition as unknown as ERC20
  );
  const { data: vaultDecimals } = useTokenDecimals(vault as unknown as ERC20);

  const { data: trancheValueSuppliedBN } = useSmartContractReadCall(
    trancheContract,
    "valueSupplied"
  );
  const { data: trancheInterestSupplyBN } = useSmartContractReadCall(
    trancheContract,
    "interestSupply"
  );

  const { data: balanceBeforeBN } = useSmartContractReadCall(
    wrappedPosition,
    "balanceOf",
    {
      callArgs: [trancheContract.address],
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

  return {
    wrappedPositionDecimals,
    vaultDecimals,
    trancheValueSuppliedBN,
    trancheInterestSupplyBN,
    balanceBeforeBN,
    vaultTotalAssetsBN,
    vaultTotalSupplyBN,
  };
}
