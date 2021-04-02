import { BigNumberish } from "ethers";
import { BytesLike, parseUnits } from "ethers/lib/utils";
import { ERC20 } from "src/types/ERC20";
import { Vault } from "src/types/Vault";

interface Swap {
  poolId: BytesLike;
  tokenInIndex: number;
  tokenOutIndex: number;
  amount: BigNumberish;
  userData: BytesLike;
}

interface FundManagement {
  sender: string;
  fromInternalBalance: boolean;
  recipient: string;
  toInternalBalance: boolean;
}

export async function queryBatchSwap(
  tokenInContract: ERC20,
  tokenOutContract: ERC20,
  poolId: string,
  sender: string,
  balancerVaultContract: Vault,
  swapInAmount: string
) {
  const tokenInAddress = tokenInContract.address;
  const tokenOutAddress = tokenOutContract.address;
  const tokenInDecimals = await tokenInContract.decimals();

  const tokens: string[] = [tokenInAddress, tokenOutAddress].sort();
  const tokenInIndex = tokens.findIndex(
    (address) => address === tokenInAddress
  );
  const tokenOutIndex = tokens.findIndex(
    (address) => address === tokenOutAddress
  );
  const amount = parseUnits(swapInAmount, tokenInDecimals);
  // have to set this to something
  const userData: BytesLike = poolId;

  // the series of swaps to perform, only one in this case.
  const swaps: Swap[] = [
    {
      poolId,
      // indicies from 'tokens', puttin FYTs in, getting base asset out.
      tokenInIndex,
      tokenOutIndex,
      amount,
      userData,
    },
  ];

  // trading with ourselves.  internal balance means internal to balancer.  we don't have anything
  // in there to start, but we'll keep whatever base assets we get from swapping in the balancer vault.
  const funds: FundManagement = {
    sender,
    fromInternalBalance: false,
    recipient: sender,
    toInternalBalance: false,
  };

  const swapReceipt = await balancerVaultContract.callStatic.queryBatchSwap(
    SwapKind.GIVEN_IN,
    swaps,
    tokens,
    funds
  );

  return swapReceipt;
}
enum SwapKind {
  GIVEN_IN,
  GIVEN_OUT,
}
