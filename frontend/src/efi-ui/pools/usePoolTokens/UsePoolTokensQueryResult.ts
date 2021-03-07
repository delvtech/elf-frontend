import { BigNumber } from "ethers";
import { QueryObserverResult } from "react-query";

export type UsePoolTokensQueryResult = QueryObserverResult<
  [string[], BigNumber[]] & {
    tokens: string[];
    balances: BigNumber[];
  },
  unknown
>;
