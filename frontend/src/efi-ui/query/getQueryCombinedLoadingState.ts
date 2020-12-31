import { QueryObserverResult } from "react-query";

export function getQueryCombinedLoadingState(
  queryResults: QueryObserverResult<unknown>[]
) {
  return queryResults.some(({ isLoading }) => isLoading);
}
