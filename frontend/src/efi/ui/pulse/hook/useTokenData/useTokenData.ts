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
  startTimeSeconds: number,
  endTimeSeconds: number
): QueryResult<TokenData[]> {
  const marketDataQueryKey = makeTokenDataQueryKey(
    tokenAddress,
    startTimeSeconds,
    endTimeSeconds
  );
  const result = useQuery(
    marketDataQueryKey,
    async (keys: string[], variables: TokenDataVariables) => {
      const { tokenAddress, startTimeSeconds, endTimeSeconds } = variables;
      return fetchTokenData(tokenAddress, startTimeSeconds, endTimeSeconds);
    }
  );

  return result;
}

interface TokenDataVariables {
  tokenAddress: string;
  startTimeSeconds: number;
  endTimeSeconds: number;
}
export function makeTokenDataQueryKey(
  tokenAddress: string,
  startTimeSeconds: number,
  endTimeSeconds: number
): [string[], TokenDataVariables] {
  return [
    ["thegraph", "tokenData"],
    { tokenAddress, startTimeSeconds, endTimeSeconds },
  ];
}
