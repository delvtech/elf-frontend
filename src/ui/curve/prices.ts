import {
  CurvePoolWith2Tokens,
  CurvePoolWith3Tokens,
} from "@elementfi/core-typechain/dist/libraries";
import { CurveLpTokenInfo, TokenInfo } from "@elementfi/tokenlist";
import { ONE_MINUTE_IN_MILLISECONDS } from "base/time";
import {
  getCurvePoolContractByCurveLpToken,
  getIdxOfTokenInCurvePool,
  isTokenInCurvePoolOfCurveLpToken,
} from "elf/curve/tokens";
import { BigNumber, BigNumberish, ethers } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { QueryObserverResult } from "react-query";
import { useSmartContractReadCall } from "ui/contracts/useSmartContractReadCall/useSmartContractReadCall";

type CurveAmountInput =
  | [BigNumberish, BigNumberish, BigNumberish]
  | [BigNumberish, BigNumberish];

function buildCurvePoolTokenAmountInput(
  curveLpToken: CurveLpTokenInfo,
  token: TokenInfo,
  amount: string
): CurveAmountInput | undefined {
  const tokenIdxInCurvePool = getIdxOfTokenInCurvePool(curveLpToken, token);
  if (tokenIdxInCurvePool === undefined) return;
  const amountInputLength = curveLpToken.extensions.poolAssets.length as 2 | 3;

  const amountInput: CurveAmountInput = new Array(amountInputLength).fill(
    0
  ) as CurveAmountInput;

  amountInput[tokenIdxInCurvePool] = parseUnits(amount, token.decimals);
  return amountInput;
}

export function useCurveLpTokenPrice(
  curveLpToken: CurveLpTokenInfo,
  token: TokenInfo,
  amount: string | undefined
): QueryObserverResult<string> {
  const isInPool = isTokenInCurvePoolOfCurveLpToken(curveLpToken, token);
  const curvePoolContract = (isInPool &&
    getCurvePoolContractByCurveLpToken(curveLpToken)) as
    | CurvePoolWith2Tokens
    | CurvePoolWith3Tokens;
  const amountInput =
    isInPool && !!amount
      ? buildCurvePoolTokenAmountInput(curveLpToken, token, amount)
      : undefined;

  const price = useSmartContractReadCall(
    curvePoolContract,
    "calc_token_amount",
    {
      callArgs: [amountInput as never, true],
      staleTime: ONE_MINUTE_IN_MILLISECONDS,
      enabled: isInPool && !!amountInput,
      select: (lpAmount) => {
        console.log(lpAmount);
        return ethers.utils.formatUnits(lpAmount, curveLpToken.decimals);
      },
    }
  );

  return price;
}
