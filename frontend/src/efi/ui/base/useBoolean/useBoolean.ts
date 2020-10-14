import { useCallback, useState } from "react";

interface BooleanState {
  value: boolean;
  setTrue: () => void;
  setFalse: () => void;
}
export function useBoolean(defaultState = false): BooleanState {
  const [value, setValue] = useState(defaultState);

  const setTrue = useCallback(() => {
    setValue(true);
  }, []);

  const setFalse = useCallback(() => {
    setValue(false);
  }, []);

  return { value, setTrue, setFalse };
}
