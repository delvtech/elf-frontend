import { QueryObserverResult } from "react-query";

export type ComputedQueryResult<TData = unknown> = [
  TData | undefined,
  QueryObserverResult<unknown>[]
];
