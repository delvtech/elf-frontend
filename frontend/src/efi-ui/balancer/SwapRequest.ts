import { BigNumberish } from "ethers";

/**
 * This is taken from the IVault.sol, which uses this interface for SwapIn and
 * SwapOut operations.
 */
export interface SwapRequest {
  poolId: string;
  tokenInIndex: number;
  tokenOutIndex: number;
  amount: BigNumberish;
  userData: string;
}
