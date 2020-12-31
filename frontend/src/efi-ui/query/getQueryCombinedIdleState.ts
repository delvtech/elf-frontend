import { QueryObserverResult } from "react-query";

export function getQueryCombinedIdleState<T = unknown>(
  queryResults: QueryObserverResult<T>[]
) {
  return queryResults.every(({ isIdle }) => isIdle);
}
