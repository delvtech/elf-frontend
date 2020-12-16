import { QueryResult } from "react-query";

export function getQueryCombinedLoadingState(
  queryResults: QueryResult<unknown>[]
) {
  return queryResults.some(({ isLoading }) => isLoading);
}
