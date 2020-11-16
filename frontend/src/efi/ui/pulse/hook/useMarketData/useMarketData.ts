import { useQuery } from "react-query";

import { fetchMarketData } from "efi/crypto/fetchMarketData";

export function useMarketData() {
  const marketDataQueryKey = makeMarketDataQueryKey();
  const marketData = useQuery(marketDataQueryKey, async () => {
    return fetchMarketData();
  });

  return marketData;
}

export function makeMarketDataQueryKey() {
  return ["marketData"];
}
