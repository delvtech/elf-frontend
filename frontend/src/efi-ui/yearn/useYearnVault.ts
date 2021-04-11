import { useQuery } from "react-query";

import { ComputedQueryResult } from "efi-ui/base/ComputedQueryResult";
import { fetchYearnVaults, YearnVaultResult } from "efi-yearn/fetchYearnVaults";

// TODO: use address when we go live on mainnet
export function useYearnVault(
  vaultSymbol: string | undefined
): ComputedQueryResult<YearnVaultResult> {
  const queryResult = useQuery<YearnVaultResult>({
    queryKey: makeYearnAPYQueryKey(vaultSymbol),
    queryFn: async () => {
      const result = await fetchYearnVaults();
      return result.find(
        (result) => result.symbol === vaultSymbol && result.endorsed
      ) as YearnVaultResult;
    },
    enabled: !!vaultSymbol,
  });

  return [queryResult.data, [queryResult]];
}

interface YearnAPYVariables {
  vaultSymbol: string | undefined;
}

function makeYearnAPYQueryKey(
  vaultSymbol: string | undefined
): [string[], YearnAPYVariables] {
  return [["yearn", "/vaults/all"], { vaultSymbol }];
}
