import { QueryObserverResult } from "react-query";

export function getQueryCombinedSuccessState(
  queryResults: QueryObserverResult<unknown>[]
) {
  return queryResults.every(({ isSuccess }) => isSuccess);
}
