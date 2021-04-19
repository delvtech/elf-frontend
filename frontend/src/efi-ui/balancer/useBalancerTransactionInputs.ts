import { useCallback, useEffect, useState } from "react";
import { usePrevious } from "react-use";

import { formatUnits, parseUnits } from "ethers/lib/utils";

import { SwapKind } from "efi-ui/balancer/SwapKind";
import { parseQueryBatchSwapResult } from "efi-ui/balancer/useQueryBatchSwap/parseQueryBatchSwapResult";
import { useQueryBatchSwap } from "efi-ui/balancer/useQueryBatchSwap/useQueryBatchSwap";
import { PoolContract } from "efi/pools/PoolContract";

/**
 * ActiveInput is used to prevent infinite calls to onSwapGivenIn and
 * onSwapGivenOut because they are not idempotent and will change based on
 * each other's latest result.
 */
type ActiveInput = "amountIn" | "amountOut";

interface UseBalancerTransactionInputs {
  amountIn: string | undefined;
  amountOut: string | undefined;
  onAmountInChange: (amountIn: string | undefined) => void;
  onAmountOutChange: (amountIn: string | undefined) => void;
}

export function useBalancerTransactionInputs(
  pool: PoolContract | undefined,
  tokenInAddress: string | undefined,
  tokenInDecimals: number | undefined,
  tokenOutAddress: string | undefined,
  tokenOutDecimals: number | undefined
): UseBalancerTransactionInputs {
  const [activeInput, setActiveInput] = useState<ActiveInput>("amountIn");
  const [amountIn, setAmountIn] = useState<string | undefined>();

  const amountInAsBigNumber = amountIn
    ? parseUnits(amountIn, tokenInDecimals)
    : undefined;
  const onAmountInChange = useCallback((newAmountIn: string | undefined) => {
    setActiveInput("amountIn");
    setAmountIn(newAmountIn);
  }, []);

  const [amountOut, setAmountOut] = useState<string | undefined>();
  const amountOutAsBigNumber = amountOut
    ? parseUnits(amountOut, tokenOutDecimals)
    : undefined;
  const onAmountOutChange = useCallback((newAmountOut: string | undefined) => {
    setActiveInput("amountOut");
    setAmountOut(newAmountOut);
  }, []);

  useClearInputsOnTokenInChange(tokenInAddress, setAmountIn, setAmountOut);

  // Calculate the amount out when the amount in changes and update state
  const { data: queryBatchSwapOutTokens } = useQueryBatchSwap(
    SwapKind.GIVEN_OUT,
    pool,
    tokenInAddress,
    tokenOutAddress,
    amountOutAsBigNumber
  );
  const { tokenIn: tokenInFromBatchSwapOut } = parseQueryBatchSwapResult(
    tokenInAddress,
    tokenOutAddress,
    queryBatchSwapOutTokens
  );
  useSyncWithActiveInput(
    tokenInFromBatchSwapOut
      ? formatUnits(tokenInFromBatchSwapOut, tokenInDecimals)
      : undefined,
    setAmountIn,
    activeInput,
    "amountIn"
  );

  // Calculate the amount in when the amount out changes and update state
  const { data: queryBatchSwapInTokens } = useQueryBatchSwap(
    SwapKind.GIVEN_IN,
    pool,
    tokenInAddress,
    tokenOutAddress,
    amountInAsBigNumber
  );
  const { tokenOut: tokenOutFromBatchSwapIn } = parseQueryBatchSwapResult(
    tokenInAddress,
    tokenOutAddress,
    queryBatchSwapInTokens
  );
  useSyncWithActiveInput(
    tokenOutFromBatchSwapIn
      ? formatUnits(tokenOutFromBatchSwapIn.abs(), tokenOutDecimals)
      : undefined,
    setAmountOut,
    activeInput,
    "amountOut"
  );

  return { amountIn, amountOut, onAmountInChange, onAmountOutChange };
}

function useClearInputsOnTokenInChange(
  tokenInAddress: string | undefined,
  setAmountIn: (aountIn: string | undefined) => void,
  setAmountOut: (aountOut: string | undefined) => void
) {
  const prevTokenInAddress = usePrevious(tokenInAddress);
  useEffect(() => {
    if (prevTokenInAddress !== tokenInAddress) {
      setAmountIn(undefined);
      setAmountOut(undefined);
    }
  }, [prevTokenInAddress, setAmountIn, setAmountOut, tokenInAddress]);
}

/**
 * When the swap amount changes, we need to update the text input.
 */
function useSyncWithActiveInput(
  newAmount: string | undefined,
  setAmount: (amount: string | undefined) => void,
  activeInput: ActiveInput,
  syncWithInput: ActiveInput
) {
  useEffect(() => {
    // don't update the active input out from under the user.
    if (activeInput === syncWithInput) {
      return;
    }

    if (!newAmount) {
      setAmount(undefined);
      return;
    }

    // Otherwise, if we have a new amount we'll set it
    const roundedAmount = (+newAmount).toFixed(4);
    setAmount(roundedAmount);
  }, [setAmount, newAmount, activeInput, syncWithInput]);
}
