import { act } from "@testing-library/react";
import { renderHook } from "@testing-library/react-hooks";

import efiLocalStorage from "efi/base/localStorage";
import { makePrefEnvelope } from "efi/prefs/prefEnvelope";
import { usePref } from "efi/ui/prefs/usePref/usePref";

test("Default value is provided when no pref exists", () => {
  const { result } = renderUsePref();

  expect(result.current.pref).toEqual("default value");
});

test("Stored value is provided when a pref already exists", () => {
  const prefEnvelope = makePrefEnvelope("this is a previously stored value");
  efiLocalStorage.setItem("test-pref", JSON.stringify(prefEnvelope));

  const { result } = renderUsePref();

  expect(result.current.pref).toEqual("this is a previously stored value");
});

test("Updating the pref causes rerender correctly", async () => {
  const { result, waitForNextUpdate } = renderUsePref();
  expect(result.current.pref).toEqual("default value");

  act(() => {
    result.current.setPref("new value!");
  });

  await waitForNextUpdate();

  // renders the new pref values
  expect(result.current.pref).toEqual("new value!");
});

function renderUsePref() {
  return renderHook(() => usePref("test-pref", "default value"));
}
