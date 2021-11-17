import { useQuery, UseQueryResult } from "react-query";

import { fetchYearnVaults, YearnVaultResult } from "efi-yearn/fetchYearnVaults";

// TODO: use address when we go live on mainnet
export function useYearnVault(
  vaultSymbol: string | undefined,
  vaultAddress: string | undefined
): UseQueryResult<YearnVaultResult> {
  return useQuery<YearnVaultResult>({
    queryKey: makeYearnAPYQueryKey(vaultAddress, vaultSymbol),
    queryFn: async () => {
      const result = await fetchYearnVaults();

      // try to match on the address exactly
      const addressResult = result.find(
        (result) => result.address === vaultAddress
      ) as YearnVaultResult;

      // if we don't get a match on the exact address we're probably on goerli
      // so we should compare by symbol instead
      const symbolResult = result.find((result) => {
        return result.symbol === vaultSymbol && result.endorsed;
      }) as YearnVaultResult;

      return addressResult || symbolResult;
    },
    enabled: !!vaultSymbol,
  });
}

interface YearnAPYVariables {
  vaultSymbol: string | undefined;
  vaultAddress: string | undefined;
}

function makeYearnAPYQueryKey(
  vaultAddress: string | undefined,
  vaultSymbol: string | undefined
): [string[], YearnAPYVariables] {
  return [["yearn", "/vaults/all"], { vaultSymbol, vaultAddress }];
}
