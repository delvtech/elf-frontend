import { QueryResult } from "react-query";

export function getQueryCombinedIdleState<T = unknown>(
  queryResults: QueryResult<T>[]
) {
  return queryResults.every(({ isIdle }) => isIdle);
}
