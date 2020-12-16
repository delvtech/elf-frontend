import { QueryResult } from "react-query";

export function getQueryCombinedErrorState(
  queryResults: QueryResult<unknown>[]
) {
  return queryResults.some(({ isError }) => isError);
}
