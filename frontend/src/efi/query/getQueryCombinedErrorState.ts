import { QueryResult } from "react-query";

export function getQueryCombinedErrorState<T = unknown>(
  queryResults: QueryResult<T>[]
) {
  return queryResults.some(({ isError }) => isError);
}
