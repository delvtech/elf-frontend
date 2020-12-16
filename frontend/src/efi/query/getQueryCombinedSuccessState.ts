import { QueryResult } from "react-query";

export function getQueryCombinedSuccessState<T = unknown>(
  queryResults: QueryResult<T>[]
) {
  return queryResults.every(({ isSuccess }) => isSuccess);
}
