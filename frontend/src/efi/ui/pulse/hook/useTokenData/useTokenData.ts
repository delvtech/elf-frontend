import { QueryResult, useQuery } from "react-query";

import { fetchTokenData, TokenData } from "efi/crypto/fetchTokenData";

/**
 * fetches the price of a token over the given range.  The price is in ETH.
 * @param tokenAddress string in hex format, i.e. "0xDEADBEEF"
 * @param startTime unix time stamp in seconds
 * @param endTime unix time stamp in seconds
 */
export function useTokenData(
  tokenAddress: string,
  startTime: number,
  endTime: number
): QueryResult<TokenData[]> {
  const marketDataQueryKey = makeTokenDataQueryKey(
    tokenAddress,
    startTime,
    endTime
  );
  const result = useQuery(
    marketDataQueryKey,
    async (keys: string[], variables: TokenDataVariables) => {
      const { tokenAddress, startTime, endTime } = variables;
      return fetchTokenData(tokenAddress, startTime, endTime);
    }
  );

  return result;
}

interface TokenDataVariables {
  tokenAddress: string;
  startTime: number;
  endTime: number;
}
export function makeTokenDataQueryKey(
  tokenAddress: string,
  startTime: number,
  endTime: number
): [string[], TokenDataVariables] {
  return [["thegraph", "tokenData"], { tokenAddress, startTime, endTime }];
}
