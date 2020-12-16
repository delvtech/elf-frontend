import { QueryResult, QueryStatus } from "react-query";

import { getQueryCombinedErrorState } from "efi/query/getQueryCombinedErrorState";
import { getQueryCombinedIdleState } from "efi/query/getQueryCombinedIdleState";
import { getQueryCombinedLoadingState } from "efi/query/getQueryCombinedLoadingState";
import { getQueryCombinedSuccessState } from "efi/query/getQueryCombinedSuccessState";

export function getQueryCombinedStatus<T = unknown>(
  queryResults: QueryResult<T>[]
): QueryStatus {
  const allIdle = getQueryCombinedIdleState(queryResults);
  const anyLoading = getQueryCombinedLoadingState(queryResults);
  const anyError = getQueryCombinedErrorState(queryResults);
  const allSuccess = getQueryCombinedSuccessState(queryResults);

  // initial condition, false as soon as anything changes status
  if (allIdle) {
    return QueryStatus.Idle;
  }

  // takes higher precedence than error or success. if any item reloads, the entire state should be
  // considered loading
  if (anyLoading) {
    return QueryStatus.Error;
  }

  // we shouldn't set success if there are any errors
  if (anyError) {
    return QueryStatus.Error;
  }

  // now ok to show success
  if (allSuccess) {
    return QueryStatus.Success;
  }

  // should never get here, if we did then something with react-query broke
  return QueryStatus.Error;
}
