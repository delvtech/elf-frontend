import { useCallback, useEffect, useState } from "react";

import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";

import { useNumericInput } from "efi-ui/base/hooks/useNumericInput/useNumericInput";

import { useBaseAssetNeededGivenPrincipalTokenIn } from "./useBaseAssetNeededGivenPrincipalTokenIn";
import { usePrincipalTokenNeededGivenBaseAssetIn } from "./usePrincipalTokenNeededGivenBaseAssetIn";

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
  onBaseAssetInChange: (amount: string) => void;
  onPrincipalTokenInChange: (amount: string) => void;
}

export function useConvergentCurvePoolStakeInputs(
  decimalsBaseAsset: number | undefined,
  decimalsPrincipalToken: number | undefined,
  reservesBaseAsset: BigNumber | undefined,
  reservesPrincipalToken: BigNumber | undefined,
  totalSupply: BigNumber | undefined
): UseConvergentCurvePoolStakeInputs {
  const [activeInput, setActiveInput] =
    useState<ConvergentCurvePoolActiveInput>("principalTokenIn");

  const {
    inputNumber: principalTokenInNumber,
    inputBigNumber: principalTokenInBigNumber,
    setInputValue: setPrincipalTokenIn,
    clearInputValue: clearPrincipalTokenIn,
  } = useStakeInput(decimalsPrincipalToken);
  const {
    inputNumber: baseAssetInNumber,
    inputBigNumber: baseAssetInBigNumber,
    setInputValue: setBaseAssetIn,
    clearInputValue: clearBaseAssetIn,
  } = useStakeInput(decimalsBaseAsset);

  const onPrincipalTokenInChange = useCallback(
    (amount: string) => {
      setActiveInput("principalTokenIn");
      setPrincipalTokenIn(amount);
    },
    [setPrincipalTokenIn]
  );

  const onBaseAssetInChange = useCallback(
    (amount: string) => {
      setActiveInput("baseAssetIn");
      setBaseAssetIn(amount);
    },
    [setBaseAssetIn]
  );

  useSyncPrincipalTokenPreview(
    baseAssetInNumber,
    decimalsBaseAsset,
    reservesBaseAsset,
    reservesPrincipalToken,
    decimalsPrincipalToken,
    totalSupply,
    activeInput,
    setPrincipalTokenIn,
    clearBaseAssetIn
  );

  useSyncBaseAssetPreview(
    principalTokenInNumber,
    decimalsPrincipalToken,
    reservesPrincipalToken,
    reservesBaseAsset,
    decimalsBaseAsset,
    totalSupply,
    activeInput,
    setBaseAssetIn,
    clearPrincipalTokenIn
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

function useSyncPrincipalTokenPreview(
  baseAssetInNumber: number | undefined,
  decimalsBaseAsset: number | undefined,
  reservesBaseAsset: BigNumber | undefined,
  reservesPrincipalToken: BigNumber | undefined,
  decimalsPrincipalToken: number | undefined,
  totalSupply: BigNumber | undefined,
  activeInput: ConvergentCurvePoolActiveInput,
  setPrincipalTokenIn: (value: string) => void,
  clearBaseAssetIn: () => void
) {
  const previewPrincipalTokenNeededGivenBaseAssetIn =
    usePrincipalTokenNeededGivenBaseAssetIn(
      baseAssetInNumber,
      decimalsBaseAsset,
      reservesBaseAsset,
      reservesPrincipalToken,
      decimalsPrincipalToken,
      totalSupply
    );
  const { otherNeeded: principalTokensNeededGivenBaseAssetIn } =
    previewPrincipalTokenNeededGivenBaseAssetIn || {};

  useSyncWithActiveInput(
    "principalTokenIn",
    activeInput,
    principalTokensNeededGivenBaseAssetIn
      ? principalTokensNeededGivenBaseAssetIn.toString()
      : undefined,
    setPrincipalTokenIn,
    clearBaseAssetIn
  );
}

function useSyncBaseAssetPreview(
  principalTokenInNumber: number | undefined,
  decimalsPrincipalToken: number | undefined,
  reservesPrincipalToken: BigNumber | undefined,
  reservesBaseAsset: BigNumber | undefined,
  decimalsBaseAsset: number | undefined,
  totalSupply: BigNumber | undefined,
  activeInput: ConvergentCurvePoolActiveInput,
  setBaseAssetIn: (value: string) => void,
  clearPrincipalTokenIn: () => void
) {
  const previewBaseAssetNeededGivenPrincipalTokenIn =
    useBaseAssetNeededGivenPrincipalTokenIn(
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
    setBaseAssetIn,
    clearPrincipalTokenIn
  );
}

/**
 * When the swap amount changes, we need to update the text input.
 */
function useSyncWithActiveInput(
  syncedInput: ConvergentCurvePoolActiveInput,
  activeInput: ConvergentCurvePoolActiveInput,
  newAmount: string | undefined,
  setAmount: (amount: string) => void,
  clearActiveInput: () => void
) {
  useEffect(() => {
    // don't update the active input out from under the user.
    if (activeInput === syncedInput) {
      return;
    }

    if (!newAmount) {
      setAmount("");
      clearActiveInput();
      return;
    }

    // Otherwise, if we have a new amount we'll set it
    setAmount((+newAmount).toFixed(4));
  }, [setAmount, newAmount, activeInput, syncedInput, clearActiveInput]);
}

function useStakeInput(inputDecimals: number | undefined) {
  const {
    onChange: onInputChange,
    stringValue: inputString,
    setValue: setInputValue,
  } = useNumericInput();

  const clearInputValue = useCallback(() => {
    setInputValue("");
  }, [setInputValue]);

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
    clearInputValue,
  };
}
