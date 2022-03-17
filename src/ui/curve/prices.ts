import { CurveLpTokenInfo, TokenInfo } from "@elementfi/tokenlist";
import { ONE_MINUTE_IN_MILLISECONDS } from "base/time";
import {
  getCurvePoolContractByCurveLpToken,
  getIdxOfTokenInCurvePool,
  isTokenInCurvePoolOfCurveLpToken,
} from "elf/curve/tokens";
import { BigNumberish } from "ethers";
import { formatUnits } from "ethers/lib/utils";
import { useCallback } from "react";
import { QueryObserverResult } from "react-query";
import { Money } from "ts-money";
import { useSmartContractReadCall } from "ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { useCurrencyPref } from "ui/prefs/useCurrency/useCurencyPref";

const CURVE_POOL_TOKEN_AMOUNT = 100;

type CurveAmountInput =
  | [BigNumberish, BigNumberish, BigNumberish]
  | [BigNumberish, BigNumberish];

function buildCurvePoolTokenAmountInput(
  curveLpToken: CurveLpTokenInfo,
  token: TokenInfo,
  amount: BigNumberish
): CurveAmountInput | undefined {
  const tokenIdxInCurvePool = getIdxOfTokenInCurvePool(curveLpToken, token);
  if (!tokenIdxInCurvePool) return;
  const amountInputLength = curveLpToken.extensions.poolAssets.length as 2 | 3;

  const amountInput: CurveAmountInput = new Array(amountInputLength).map(
    () => 0
  ) as CurveAmountInput;

  amountInput[tokenIdxInCurvePool] = amount;
  return amountInput;
}

export function useCurveLpTokenPrice(
  curveLpToken: CurveLpTokenInfo,
  token: TokenInfo
): QueryObserverResult<Money> {
  const { currency } = useCurrencyPref();
  const curvePoolContract = getCurvePoolContractByCurveLpToken(curveLpToken);
  const isInPool = isTokenInCurvePoolOfCurveLpToken(curveLpToken, token);
  const amountInput =
    isInPool &&
    buildCurvePoolTokenAmountInput(
      curveLpToken,
      token,
      CURVE_POOL_TOKEN_AMOUNT
    );

  const price = useSmartContractReadCall(
    curvePoolContract,
    "calc_token_amount",
    {
      callArgs: [amountInput as never, true],
      staleTime: ONE_MINUTE_IN_MILLISECONDS,
      enabled: isInPool && !!amountInput,
      select: useCallback(
        (lpAmount) => {
          const price =
            +formatUnits(lpAmount, curveLpToken.decimals) /
            CURVE_POOL_TOKEN_AMOUNT;
          return Money.fromDecimal(price, currency.code, Math.round);
        },
        [currency, curveLpToken]
      ),
    }
  );

  return price;
}
