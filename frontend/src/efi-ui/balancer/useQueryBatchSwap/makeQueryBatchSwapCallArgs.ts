import { Vault } from "elf-contracts/types/Vault";
import { BigNumber } from "ethers";

import { FundManagement } from "efi-ui/balancer/FundManagement";
import { SwapKind } from "efi-ui/balancer/SwapKind";
import { BatchSwapStep } from "efi-ui/balancer/SwapRequest";
import { BALANCER_ETH_SENTINEL } from "efi/balancer";
import { StaticContractMethodArgs } from "efi/contracts/types";

/**
 * This is a simple read-only funds argument for queryBatchSwap
 */
const QUERY_BATCH_SWAP_FUNDS: FundManagement = {
  sender: BALANCER_ETH_SENTINEL,
  recipient: BALANCER_ETH_SENTINEL,
  toInternalBalance: false,
  fromInternalBalance: false,
};

export function makeQueryBatchSwapCallArgs(
  kind: SwapKind,
  poolId: string | undefined,
  tokenInAddress: string | undefined,
  amount: BigNumber | undefined,
  tokenOutAddress: string | undefined
): StaticContractMethodArgs<Vault, "queryBatchSwap"> | undefined {
  if (!poolId || !amount?.gt(0) || !tokenInAddress || !tokenOutAddress) {
    return undefined;
  }

  // queryBatchSwap requires that the assets be sorted
  const assets = [tokenInAddress, tokenOutAddress].sort();
  const assetInIndex = assets.findIndex(
    (address) => address === tokenInAddress
  );
  const assetOutIndex = assets.findIndex(
    (address) => address === tokenOutAddress
  );

  const swaps: BatchSwapStep[] = [
    {
      poolId,
      assetInIndex,
      assetOutIndex,
      amount,
      // no need to pass data
      userData: "0x00",
      // userData: defaultAbiCoder.encode(["uint8"], ["0x00"]),
    },
  ];

  const callArgs: StaticContractMethodArgs<Vault, "queryBatchSwap"> = [
    kind,
    swaps,
    assets,
    QUERY_BATCH_SWAP_FUNDS,
  ];

  return callArgs;
}
