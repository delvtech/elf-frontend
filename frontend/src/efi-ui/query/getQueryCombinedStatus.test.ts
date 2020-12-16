import { QueryResult, QueryStatus } from "react-query";
import { getQueryCombinedStatus } from "efi-ui/query/getQueryCombinedStatus";
test("should return idle", () => {
  const queryResults = [
    { isIdle: true },
    { isIdle: true },
  ] as QueryResult<unknown>[];
  expect(getQueryCombinedStatus(queryResults)).toEqual(QueryStatus.Idle);
});

test("should not return idle", () => {
  const queryResults = [
    { isIdle: true },
    { isIdle: false },
  ] as QueryResult<unknown>[];
  expect(getQueryCombinedStatus(queryResults)).not.toEqual(QueryStatus.Idle);
});

test("should return loading", () => {
  const resultA: Partial<QueryResult<unknown>> = { isIdle: true };
  const resultB: Partial<QueryResult<unknown>> = { isLoading: true };

  const queryResults = [resultA, resultB] as QueryResult<unknown>[];
  expect(getQueryCombinedStatus(queryResults)).toEqual(QueryStatus.Loading);

  resultA.isIdle = false;
  resultA.isError = true;

  expect(getQueryCombinedStatus(queryResults)).toEqual(QueryStatus.Loading);

  resultA.isError = false;
  resultA.isSuccess = true;

  expect(getQueryCombinedStatus(queryResults)).toEqual(QueryStatus.Loading);
});

test("should return error", () => {
  const resultA: Partial<QueryResult<unknown>> = { isSuccess: true };
  const resultB: Partial<QueryResult<unknown>> = { isError: true };

  const queryResults = [resultA, resultB] as QueryResult<unknown>[];
  expect(getQueryCombinedStatus(queryResults)).toEqual(QueryStatus.Error);
});

test("should return success", () => {
  const queryResults = [
    { isSuccess: true },
    { isSuccess: true },
  ] as QueryResult<unknown>[];
  expect(getQueryCombinedStatus(queryResults)).toEqual(QueryStatus.Success);
});

test("should default to error", () => {
  // this is a case that shouldn't happen.  the first result doesn't have any status so even though
  // the second is a success, we should return an error.
  const queryResults = [
    { isSuccess: false },
    { isSuccess: true },
  ] as QueryResult<unknown>[];
  expect(getQueryCombinedStatus(queryResults)).toEqual(QueryStatus.Error);
});
