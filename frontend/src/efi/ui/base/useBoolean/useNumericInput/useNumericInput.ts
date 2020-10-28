import { ChangeEvent, useCallback, useState } from "react";

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
  precision?: number;
}

const validDecimalNumber = /^-?[0-9]\d*\.?\d*$/;

/**
 * A hook to handle limiting the user's interaction with a numeric input.  This can be used on text
 * inputs as well to ensure that only numeric values are allowed.
 * @param options
 */
export const useNumericInput = (
  options: NumericInputOptions
): [string | undefined, (event: ChangeEvent<HTMLInputElement>) => void] => {
  const { min, max, precision } = options;
  const [stringValue, setStringValue] = useState<string | undefined>();

  const onChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const inputString = event.target.value as string | undefined;
      const inputValue = Number(inputString);

      if (inputString === undefined || inputString === "") {
        setStringValue(inputString);
        return;
      }

      if (!validDecimalNumber.test(inputString)) {
        return;
      }

      if (!Number.isFinite(inputValue)) {
        return;
      }

      if ("min" in options && NumberIsFinite(min)) {
        if (inputValue < min) {
          return;
        }
      }

      if ("max" in options && NumberIsFinite(max)) {
        if (inputValue > max) {
          return;
        }
      }

      if ("precision" in options && NumberIsFinite(precision)) {
        const placesAfterDecimal = getPlacesAfterDecimal(inputString);
        if (placesAfterDecimal > precision) {
          return;
        }
      }

      setStringValue(inputString);
    },
    [max, min, options, precision]
  );

  return [stringValue, onChange];
};

/**
 * Helper function to get the number of digits after the decimal.  Assumes a properly formatted
 * number with only numeric characters and 0 or 1 decimals
 *
 * @param stringValue a numeric string with or without a decimal i.e. 3.14 or 42.
 */
function getPlacesAfterDecimal(stringValue: string): number {
  const hasDecimal = stringValue.indexOf(".") !== -1;

  if (hasDecimal) {
    return stringValue.split(".")[1].length;
  }

  return 0;
}

/**
 * Number.isFinite doesn't type guard to number.
 * @param num value to test
 */
function NumberIsFinite(num: unknown): num is number {
  return Number.isFinite(num as number);
}
