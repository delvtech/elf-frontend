import { QueryObserverResult, UseQueryResult } from "react-query";

export type ComputedQueryResult<TData = unknown> = [
  TData | undefined,
  QueryObserverResult<unknown>[] | UseQueryResult<unknown>
];
