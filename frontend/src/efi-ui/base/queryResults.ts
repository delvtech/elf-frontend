import { QueryObserverResult } from "react-query";

export function getQueryData<T>(queryResult: QueryObserverResult<T>) {
  return queryResult.data;
}

export function getQueriesData<T>(queryResults: QueryObserverResult<T>[]) {
  return queryResults.map((result) => getQueryData(result));
}
