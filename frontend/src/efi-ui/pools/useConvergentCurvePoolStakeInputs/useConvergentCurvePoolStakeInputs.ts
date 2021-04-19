import { useCallback, useEffect, useMemo, useState } from "react";

import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";

import { useNumericInput } from "efi-ui/base/hooks/useNumericInput/useNumericInput";

import { calculateBaseAssetNeededForPrincipalTokenIn } from "./calculateBaseAssetNeededForPrincipalTokenIn";
import { calculatePrincipalTokenNeededForBaseAssetIn } from "./calculatePrincipalTokenNeededForBaseAssetIn";

/**
 * ActiveInput is used to prevent infinite calls to onSwapGivenIn and
 * onSwapGivenOut because they are not idempotent and will change based on
 * each other's latest result.
 */
export type ConvergentCurvePoolActiveInput = "baseAssetIn" | "principalTokenIn";

interface UseConvergentCurvePoolStakeInputs {
  activeInput: ConvergentCurvePoolActiveInput;
  principalTokenIn: number | undefined;
  principalTokenInBigNumber: BigNumber | undefined;
  baseAssetIn: number | undefined;
  baseAssetInBigNumber: BigNumber | undefined;
  onBaseAssetInChange: (amount: string | undefined) => void;
  onPrincipalTokenInChange: (amount: string | undefined) => void;
}

export function useConvergentCurvePoolStakeInputs(
  decimalsBaseAsset: number | undefined,
  decimalsPrincipalToken: number | undefined,
  reservesBaseAsset: BigNumber | undefined,
  reservesPrincipalToken: BigNumber | undefined,
  totalSupply: BigNumber | undefined
): UseConvergentCurvePoolStakeInputs {
  const [
    activeInput,
    setActiveInput,
  ] = useState<ConvergentCurvePoolActiveInput>("principalTokenIn");

  const {
    inputNumber: principalTokenInNumber,
    inputBigNumber: principalTokenInBigNumber,
    setInputValue: setPrincipalTokenIn,
  } = useStakeInput(decimalsPrincipalToken);
  const onPrincipalTokenInChange = useCallback(
    (amount: string | undefined) => {
      setActiveInput("principalTokenIn");
      setPrincipalTokenIn(amount);
    },
    [setPrincipalTokenIn]
  );

  const {
    inputNumber: baseAssetInNumber,
    inputBigNumber: baseAssetInBigNumber,
    setInputValue: setBaseAssetIn,
  } = useStakeInput(decimalsBaseAsset);
  const onBaseAssetInChange = useCallback(
    (amount: string | undefined) => {
      setActiveInput("baseAssetIn");
      setBaseAssetIn(amount);
    },
    [setBaseAssetIn]
  );

  // The amount of the base asset you'll need when you change the amount of principal tokens in
  const previewBaseAssetNeededGivenPrincipalTokenIn = useBaseAssetNeededGivenPrincipalTokenIn(
    principalTokenInNumber,
    decimalsPrincipalToken,
    reservesPrincipalToken,
    reservesBaseAsset,
    decimalsBaseAsset,
    totalSupply
  );
  const { otherNeeded: baseAssetNeededGivenPrincipalTokenIn } =
    previewBaseAssetNeededGivenPrincipalTokenIn || {};

  useSyncWithActiveInput(
    "baseAssetIn",
    activeInput,
    baseAssetNeededGivenPrincipalTokenIn
      ? baseAssetNeededGivenPrincipalTokenIn.toString()
      : undefined,
    setBaseAssetIn
  );

  const previewPrincipalTokenNeededGivenBaseAssetIn = usePrincipalTokenNeededGivenBaseAssetIn(
    baseAssetInNumber,
    decimalsBaseAsset,
    reservesBaseAsset,
    reservesPrincipalToken,
    decimalsPrincipalToken,
    totalSupply
  );
  console.log(
    "previewPrincipalTokenNeededGivenBaseAssetIn",
    previewPrincipalTokenNeededGivenBaseAssetIn
  );
  const { otherNeeded: principalTokensNeededGivenBaseAssetIn } =
    previewPrincipalTokenNeededGivenBaseAssetIn || {};
  useSyncWithActiveInput(
    "principalTokenIn",
    activeInput,
    principalTokensNeededGivenBaseAssetIn
      ? principalTokensNeededGivenBaseAssetIn.toString()
      : undefined,
    setPrincipalTokenIn
  );

  return {
    activeInput,
    baseAssetIn: baseAssetInNumber,
    baseAssetInBigNumber: baseAssetInBigNumber,
    principalTokenIn: principalTokenInNumber,
    principalTokenInBigNumber: principalTokenInBigNumber,
    onBaseAssetInChange,
    onPrincipalTokenInChange,
  };
}

function useBaseAssetNeededGivenPrincipalTokenIn(
  principalTokenInAmount: number | undefined,
  decimalsPrincipalToken: number | undefined,
  principalTokenReserves: BigNumber | undefined,
  baseAssetReserves: BigNumber | undefined,
  decimalsBaseAsset: number | undefined,
  totalSupply: BigNumber | undefined
) {
  return useMemo(() => {
    if (
      principalTokenInAmount === undefined ||
      !decimalsPrincipalToken ||
      !principalTokenReserves ||
      !baseAssetReserves ||
      !decimalsBaseAsset ||
      !totalSupply
    ) {
      return;
    }
    return calculateBaseAssetNeededForPrincipalTokenIn(
      principalTokenInAmount,
      principalTokenReserves,
      baseAssetReserves,
      totalSupply,
      decimalsPrincipalToken,
      decimalsBaseAsset
    );
  }, [
    decimalsPrincipalToken,
    principalTokenInAmount,
    principalTokenReserves,
    decimalsBaseAsset,
    baseAssetReserves,
    totalSupply,
  ]);
}

function usePrincipalTokenNeededGivenBaseAssetIn(
  baseAssetTokenInAmount: number | undefined,
  decimalsBaseAsset: number | undefined,
  baseAssetReserves: BigNumber | undefined,
  principalTokenReserves: BigNumber | undefined,
  decimalsPrincipalToken: number | undefined,
  totalSupply: BigNumber | undefined
) {
  return useMemo(() => {
    if (
      baseAssetTokenInAmount === undefined ||
      !decimalsPrincipalToken ||
      !principalTokenReserves ||
      !baseAssetReserves ||
      !decimalsBaseAsset ||
      !totalSupply
    ) {
      return;
    }
    return calculatePrincipalTokenNeededForBaseAssetIn(
      baseAssetTokenInAmount,
      principalTokenReserves,
      baseAssetReserves,
      totalSupply,
      decimalsPrincipalToken,
      decimalsBaseAsset
    );
  }, [
    decimalsPrincipalToken,
    baseAssetTokenInAmount,
    principalTokenReserves,
    decimalsBaseAsset,
    baseAssetReserves,
    totalSupply,
  ]);
}

/**
 * When the swap amount changes, we need to update the text input.
 */
function useSyncWithActiveInput(
  syncedInput: ConvergentCurvePoolActiveInput,
  activeInput: ConvergentCurvePoolActiveInput,
  newAmount: string | undefined,
  setAmount: (amount: string | undefined) => void
) {
  useEffect(() => {
    // don't update the active input out from under the user.
    if (activeInput === syncedInput) {
      return;
    }

    if (!newAmount) {
      setAmount(undefined);
      return;
    }

    // Otherwise, if we have a new amount we'll set it
    setAmount((+newAmount).toFixed(4));
  }, [setAmount, newAmount, activeInput, syncedInput]);
}

function useStakeInput(inputDecimals: number | undefined) {
  const {
    onChange: onInputChange,
    stringValue: inputString,
    setValue: setInputValue,
  } = useNumericInput();

  const inputBigNumber = inputString
    ? parseUnits(inputString, inputDecimals)
    : undefined;

  const inputNumber = inputString ? +inputString : undefined;

  return {
    inputString,
    inputNumber,
    inputBigNumber,
    onInputChange,
    setInputValue,
  };
}
