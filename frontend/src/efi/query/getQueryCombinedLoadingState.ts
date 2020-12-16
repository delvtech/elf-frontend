import { QueryResult } from "react-query";

export function getQueryCombinedLoadingState<T = unknown>(
  queryResults: QueryResult<T>[]
) {
  return queryResults.some(({ isLoading }) => isLoading);
}
