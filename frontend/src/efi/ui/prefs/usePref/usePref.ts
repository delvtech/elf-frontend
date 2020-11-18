import { useCallback } from "react";
import { queryCache, useQuery } from "react-query";

import isEqual from "lodash.isequal";

import efiLocalStorage from "efi/base/localStorage";

interface PrefVariables {
  id: string;
}

interface PrefResult<T> {
  pref: T;
  setPref: (newPref: T) => void;
}

export function usePref<T>(id: string, defaultValue: T): PrefResult<T> {
  const queryKey = makePrefQueryKey(id);

  const { data: pref } = useQuery<T>(
    queryKey,
    (key: string[], variables: PrefVariables): T => {
      const item = efiLocalStorage.getItem(variables.id);

      if (item) {
        return JSON.parse(item) as T;
      }

      return defaultValue;
    },
    { initialData: defaultValue }
  );

  const setPref = useCallback(
    async (newPref: T) => {
      // Save to local storage
      efiLocalStorage.setItem(id, JSON.stringify(newPref));

      // Invalidate this pref so callers will re-ensure the data as needed
      queryCache.invalidateQueries((query) => {
        return isEqual(query.queryKey, makePrefQueryKey(id));
      });
    },
    [id]
  );

  return {
    pref: pref as T, // safe to cast because initialData is set in useQuery
    setPref,
  };
}

function makePrefQueryKey(id: string) {
  const queryKey = [["efi", "prefs"], { id }];
  return queryKey;
}
