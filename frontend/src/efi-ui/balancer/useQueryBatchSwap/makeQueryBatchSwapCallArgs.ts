import { Vault } from "elf-contracts/types/Vault";
import { BigNumber } from "ethers";
import { parseEther } from "ethers/lib/utils";

import { FundManagement } from "efi-balancer/FundManagement";
import { SwapKind } from "efi-balancer/SwapKind";
import { BatchSwapStep } from "efi-ui/balancer/SwapRequest";
import {
  BALANCER_ETH_SENTINEL,
  mapETHSentinalToWETH,
  mapWETHToETHSentinal,
} from "efi/balancer";
import { sortAddresses } from "efi/base/sortAddresses";
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

  // balancer's batchSwap requires that the assets be sorted
  let assets = sortAddresses([tokenInAddress, tokenOutAddress]);
  // ETH is a special case. Balancer uses the
  // zero address as an address sentinel for ETH, but still expects the addresses sorted as though
  // it were WETH.
  if (assets.includes(BALANCER_ETH_SENTINEL)) {
    assets = sortAddresses(assets.map(mapETHSentinalToWETH)).map(
      mapWETHToETHSentinal
    );
  }

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
    },
  ];

  const callArgs: StaticContractMethodArgs<Vault, "queryBatchSwap"> = [
    kind,
    swaps,
    assets,
    QUERY_BATCH_SWAP_FUNDS,
    { gasLimit: parseEther("1") },
  ];

  return callArgs;
}
