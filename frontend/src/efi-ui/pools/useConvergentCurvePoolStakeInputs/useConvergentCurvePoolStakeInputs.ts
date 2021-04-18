import { useCallback, useEffect, useMemo, useState } from "react";

import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";

import { useNumericInput } from "efi-ui/base/hooks/useNumericInput/useNumericInput";

import { calculateOtherForGivenIn } from "./calculateOtherForGivenIn";

/**
 * ActiveInput is used to prevent infinite calls to onSwapGivenIn and
 * onSwapGivenOut because they are not idempotent and will change based on
 * each other's latest result.
 */
type ActiveInput = "givenIn" | "otherAmount";

interface UseConvergentCurvePoolStakeInputs {
  givenIn: string | undefined;
  otherAmount: string | undefined;
  onGivenInChange: (amount: string | undefined) => void;
  onOtherAmountChange: (amount: string | undefined) => void;
}

export function useConvergentCurvePoolStakeInputs(
  givenInDecimals: number | undefined,
  otherDecimals: number | undefined,
  givenInReserves: BigNumber | undefined,
  otherReserves: BigNumber | undefined,
  totalSupply: BigNumber | undefined
): UseConvergentCurvePoolStakeInputs {
  const [activeInput, setActiveInput] = useState<ActiveInput>("givenIn");

  const {
    inputString: givenInString,
    inputNumber: givenInNumber,
    setInputValue: setGivenIn,
  } = useStakeInput(givenInDecimals);
  const onGivenInChange = useCallback(
    (amount: string | undefined) => {
      setActiveInput("givenIn");
      setGivenIn(amount);
    },
    [setGivenIn]
  );

  const { inputString: otherString, setInputValue: setOther } = useStakeInput(
    otherDecimals
  );
  const onOtherChange = useCallback(
    (amount: string | undefined) => {
      setActiveInput("givenIn");
      setOther(amount);
    },
    [setOther]
  );

  // The amount of the second token you'll need when the first token changes
  const otherAmount = useOtherAmountPreview(
    givenInNumber,
    givenInDecimals,
    givenInReserves,
    otherReserves,
    otherDecimals,
    totalSupply
  );

  // The amount of the first token you'll need when the second token changes
  const givenInAmount = useOtherAmountPreview(
    givenInNumber,
    givenInDecimals,
    givenInReserves,
    otherReserves,
    otherDecimals,
    totalSupply
  );

  // update the correct inputs when the user types
  useSyncWithActiveInput(
    otherAmount ? otherAmount.toString() : undefined,
    setGivenIn,
    activeInput,
    "givenIn"
  );
  useSyncWithActiveInput(
    givenInAmount ? givenInAmount.toString() : undefined,
    setOther,
    activeInput,
    "otherAmount"
  );

  return {
    givenIn: givenInString,
    otherAmount: otherString,
    onGivenInChange: onGivenInChange,
    onOtherAmountChange: onOtherChange,
  };
}

function useOtherAmountPreview(
  givenInNumber: number | undefined,
  givenInDecimals: number | undefined,
  givenInReserves: BigNumber | undefined,
  otherReserves: BigNumber | undefined,
  otherDecimals: number | undefined,
  totalSupply: BigNumber | undefined
) {
  return useMemo(() => {
    if (
      !givenInNumber ||
      !givenInDecimals ||
      !givenInReserves ||
      !otherReserves ||
      !otherDecimals ||
      !totalSupply
    ) {
      return;
    }
    return calculateOtherForGivenIn(
      givenInNumber,
      givenInReserves,
      otherReserves,
      totalSupply,
      givenInDecimals,
      otherDecimals
    );
  }, [
    givenInDecimals,
    givenInNumber,
    givenInReserves,
    otherDecimals,
    otherReserves,
    totalSupply,
  ]);
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
    setAmount(newAmount);
  }, [setAmount, newAmount, activeInput, syncWithInput]);
}
