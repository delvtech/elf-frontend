import { QueryObserverResult } from "react-query";

export function getQueryCombinedErrorState(
  queryResults: QueryObserverResult<unknown>[]
) {
  return queryResults.some(({ isError }) => isError);
}
