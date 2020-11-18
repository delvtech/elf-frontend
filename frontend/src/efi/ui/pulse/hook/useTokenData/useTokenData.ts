import { useQuery } from "react-query";

import { fetchTokenData } from "efi/crypto/fetchTokenData";

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
) {
  const marketDataQueryKey = makeTokenDataQueryKey(
    tokenAddress,
    startTime,
    endTime
  );
  const marketData = useQuery(
    marketDataQueryKey,
    async (keys: string[], variables: TokenDataVariables) => {
      const { tokenAddress, startTime, endTime } = variables;
      return fetchTokenData(tokenAddress, startTime, endTime);
    }
  );

  return marketData;
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
