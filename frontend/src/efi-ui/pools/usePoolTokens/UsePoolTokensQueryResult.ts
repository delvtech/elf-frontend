import { BigNumber } from "ethers";
import { QueryObserverResult } from "react-query";

export type UsePoolTokensQueryResult = QueryObserverResult<
  [
    // addresses
    string[],
    // balances
    BigNumber[]
  ],
  unknown
>;
