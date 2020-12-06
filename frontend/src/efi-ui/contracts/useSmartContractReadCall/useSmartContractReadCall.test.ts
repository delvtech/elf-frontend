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
