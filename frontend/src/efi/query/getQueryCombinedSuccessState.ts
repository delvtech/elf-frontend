import { QueryResult } from "react-query";

export function getQueryCombinedSuccessState(
  queryResults: QueryResult<unknown>[]
) {
  return queryResults.every(({ isSuccess }) => isSuccess);
}
