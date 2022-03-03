import { BigNumber, BytesLike } from "ethers";

import { SwapKind } from "integrations/efi-balancer/SwapKind";

export interface SingleSwap {
  poolId: BytesLike;
  kind: SwapKind;
  assetIn: string;
  assetOut: string;
  amount: BigNumber;
  userData: BytesLike;
}
