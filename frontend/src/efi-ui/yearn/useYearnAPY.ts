import { useQuery } from "react-query";

import { ComputedQueryResult } from "efi-ui/base/ComputedQueryResult";
import { fetchYearnAPYs, YearnAPYResult } from "efi-yearn/fetchYearnAPY";

// TODO: use address when we go live on mainnet
export function useYearnAPY(
  vaultSymbol: string | undefined
): ComputedQueryResult<YearnAPYResult> {
  const queryResult = useQuery<YearnAPYResult>({
    queryKey: makeYearnAPYQueryKey(vaultSymbol),
    queryFn: async () => {
      const result = await fetchYearnAPYs();
      return result.find(
        (result) => result.vaultSymbol === vaultSymbol
      ) as YearnAPYResult;
    },
    enabled: !!vaultSymbol,
  });

  return [queryResult.data, queryResult];
}

interface YearnAPYVariables {
  vaultSymbol: string | undefined;
}

function makeYearnAPYQueryKey(
  vaultSymbol: string | undefined
): [string[], YearnAPYVariables] {
  return [["yearn", "/vaults/apy"], { vaultSymbol }];
}
