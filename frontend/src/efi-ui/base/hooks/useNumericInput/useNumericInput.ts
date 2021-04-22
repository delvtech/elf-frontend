import { ChangeEvent, useCallback, useState } from "react";

import { ANY_NUMBER_REGEX } from "efi/base/numbers";
import { getPlacesAfterDecimal } from "efi/math/fixedPoint";

export interface NumericInputOptions {
  /**
   * If the user tries to enter a value lower than min, the change is ignored.
   */
  min?: number;

  /**
   * If the user tries to enter a value higher than the max, the change is ignored.
   */
  max?: number;

  /**
   * Integer value for the number of digits allowed after the decimal.  If the user tries to enter
   * more digits than precision, the change is ignored.
   */
  maxPrecision?: number;
}

interface UseNumericInput {
  stringValue: string | undefined;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  setValue: (value: string | undefined) => void;
}

const DEFAULT_NUMERIC_INPUT_OPTIONS: NumericInputOptions = {
  /**
   * Default to 0, as numeric inputs will rarely if ever accept negative inputs
   * from the user
   */
  min: 0,
};

/**
 * A hook to handle limiting the user's interaction with a numeric input.  This can be used on text
 * inputs as well to ensure that only numeric values are allowed.
 * @param options
 */
export function useNumericInput(
  options = DEFAULT_NUMERIC_INPUT_OPTIONS
): UseNumericInput {
  const [stringValue, setStringValueState] = useState<string | undefined>();
  const { min, max, maxPrecision } = options;

  const setValue = useCallback(
    (inputString: string | undefined) => {
      // clear the input
      if (inputString === undefined || inputString === "") {
        setStringValueState(undefined);
        return;
      }

      // or validate and set it
      if (validateInput(inputString, min, max, maxPrecision)) {
        setStringValueState(inputString);
      }
    },
    [max, maxPrecision, min]
  );

  const onChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const inputString = event.target.value as string | undefined;

      // clear the input
      setValue(inputString);
    },
    [setValue]
  );

  return {
    stringValue,
    onChange,
    setValue,
  };
}

function validateInput(
  inputString: string,
  min: number | undefined,
  max: number | undefined,
  maxPrecision: number | undefined
): boolean {
  const inputValue = Number(inputString);
  if (!ANY_NUMBER_REGEX.test(inputString)) {
    return false;
  }

  if (!isFiniteNumber(inputValue)) {
    return false;
  }

  if (isFiniteNumber(min)) {
    if (inputValue < min) {
      return false;
    }
  }

  if (isFiniteNumber(max)) {
    if (inputValue > max) {
      return false;
    }
  }

  if (isIntegerNumber(maxPrecision)) {
    const placesAfterDecimal = getPlacesAfterDecimal(inputString);
    if (placesAfterDecimal > maxPrecision) {
      return false;
    }
  }

  return true;
}

/**
 * Number.isFinite doesn't type guard to number.
 * @param num value to test
 */
function isFiniteNumber(num: unknown): num is number {
  return Number.isFinite(num as number);
}

/**
 * Number.isInteger doesn't type guard to number.
 * @param num value to test
 */
function isIntegerNumber(num: unknown): num is number {
  return Number.isInteger(num as number);
}
