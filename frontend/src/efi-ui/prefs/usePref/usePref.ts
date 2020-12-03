import { useCallback } from "react";
import { queryCache, useQuery } from "react-query";

import isEqual from "lodash.isequal";

import efiLocalStorage from "efi/base/localStorage";
import { makePrefEnvelope, PrefEnvelope } from "efi/prefs/prefEnvelope";

interface PrefVariables {
  id: string;
}

interface PrefResult<T> {
  pref: T;
  setPref: (newPref: T) => void;
}

export function usePref<T>(id: string, defaultValue: T): PrefResult<T> {
  const queryKey = makePrefQueryKey(id);

  const { data: prefEnvelope } = useQuery<PrefEnvelope<T>>(
    queryKey,
    (key: string[], variables: PrefVariables) => {
      return (
        getPrefFromLocalStorage(variables.id) ?? makePrefEnvelope(defaultValue)
      );
    },
    {
      initialData: () =>
        getPrefFromLocalStorage<T>(id) ?? makePrefEnvelope(defaultValue),
    }
  );

  const setPref = useCallback(
    (newPref: T) => {
      // Use an envelope because JSON.stringify likes serializable objects and
      // prefs could be anything
      const prefEnvelope = makePrefEnvelope(newPref);
      efiLocalStorage.setItem(id, JSON.stringify(prefEnvelope));

      // Invalidate this pref so callers will re-ensure the data as needed
      queryCache.invalidateQueries((query) => {
        return isEqual(query.queryKey, queryKey);
      });
    },
    [id, queryKey]
  );

  return {
    pref: (prefEnvelope as PrefEnvelope<T>).pref, // safe to cast because initialData is set in useQuery
    setPref,
  };
}

function makePrefQueryKey(id: string) {
  const queryKey = [["efi", "prefs"], { id }];
  return queryKey;
}

function getPrefFromLocalStorage<T>(id: string): PrefEnvelope<T> | undefined {
  const prefString = efiLocalStorage.getItem(id);
  if (!prefString) {
    return;
  }

  const prefEnvelope: PrefEnvelope<T> = JSON.parse(prefString);
  return prefEnvelope;
}
