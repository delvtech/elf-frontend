import { renderHook } from "@testing-library/react-hooks";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { Contract } from "ethers";

const SAMPLE_READ_CONTRACT_CALL_RESULT = { 0: "sample contract name" };

test("provides data from smart contract read methods", async () => {
  const mockNameFn = jest.fn(async () => SAMPLE_READ_CONTRACT_CALL_RESULT);

  const { result, waitForNextUpdate, rerender } = renderHook(() =>
    useSmartContractReadCall(
      ({ functions: { name: mockNameFn } } as any) as Contract,
      "name"
    )
  );

  expect(result.current.data).toEqual(undefined);

  await waitForNextUpdate();
  expect(mockNameFn).toBeCalledTimes(1);
  expect(result.current.data).toEqual(SAMPLE_READ_CONTRACT_CALL_RESULT);

  rerender();

  expect(mockNameFn).toBeCalledTimes(1);
  expect(result.current.data).toEqual(SAMPLE_READ_CONTRACT_CALL_RESULT);
});

test("passes arguments to smart contract read methods", async () => {
  const mockFn = jest.fn(async (a: string, b: string) => [a, b].join(" "));

  const { result, waitForNextUpdate, rerender } = renderHook(() =>
    useSmartContractReadCall(
      ({ functions: { name: mockFn } } as any) as Contract,
      "name",
      { callArgs: ["firstarg", "secondArg"] }
    )
  );

  expect(result.current.data).toEqual(undefined);

  await waitForNextUpdate();
  expect(mockFn).toBeCalledTimes(1);
  expect(mockFn).toBeCalledWith("firstarg", "secondArg");
  expect(result.current.data).toEqual("firstarg secondArg");

  rerender();

  expect(mockFn).toBeCalledTimes(1);
});

test("properly handles enabled option", async () => {
  const mockFn = jest.fn(async (a: string, b: string) => [a, b].join(" "));

  const { result, waitForNextUpdate, rerender } = renderHook(
    ({ enabled }) =>
      useSmartContractReadCall(
        ({ functions: { name: mockFn } } as any) as Contract,
        "name",
        { callArgs: ["firstarg", "secondArg"], enabled }
      ),
    { initialProps: { enabled: false } }
  );

  expect(result.current.data).toEqual(undefined);

  expect(mockFn).toBeCalledTimes(0);

  rerender({ enabled: true });
  await waitForNextUpdate();

  expect(mockFn).toBeCalledTimes(1);
  expect(mockFn).toBeCalledWith("firstarg", "secondArg");
  expect(result.current.data).toEqual("firstarg secondArg");
});
