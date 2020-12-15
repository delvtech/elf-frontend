import { QueryResult } from "react-query";

export type ComputedQueryResult<TData = unknown> = [
  TData | undefined,
  QueryResult<unknown>[]
];
