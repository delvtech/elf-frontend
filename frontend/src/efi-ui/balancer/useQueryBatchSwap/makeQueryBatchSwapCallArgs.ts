import { Vault } from "elf-contracts/types/Vault";
import { BigNumber } from "ethers";

import { SwapKind } from "efi-ui/balancer/SwapKind";
import { StaticContractMethodArgs } from "efi/contracts/types";
import { SwapRequest } from "efi-ui/balancer/SwapRequest";
import { FundManagement } from "efi-ui/balancer/FundManagement";
import { ETH_ZERO_ADDRESS } from "efi/crypto/ethereum";

/**
 * This is a simple read-only funds argument for queryBatchSwap
 */
const QUERY_BATCH_SWAP_FUNDS: FundManagement = {
  sender: ETH_ZERO_ADDRESS,
  recipient: ETH_ZERO_ADDRESS,
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
  if (!poolId || !amount || !tokenInAddress || !tokenOutAddress) {
    return undefined;
  }

  const assets = [tokenInAddress, tokenOutAddress];
  const tokenInIndex = 0;
  const tokenOutIndex = 1;

  const swaps: SwapRequest[] = [
    {
      poolId,
      amount,
      tokenInIndex,
      tokenOutIndex,
      userData: ETH_ZERO_ADDRESS,
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
