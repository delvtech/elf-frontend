import { useTokenBalance } from "efi-ui/token/hooks/useTokenBalance";
import { useTrancheContract } from "efi-ui/tranche/useTrancheContract";
import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";

/**
 * @deprecated
 */
export function useTrancheBalanceOld(
  account: string | null | undefined,
  trancheAddress: string | undefined
): number {
  const trancheContract = useTrancheContract(trancheAddress, jsonRpcProvider);
  const trancheBalance = useTokenBalance(trancheContract, account);

  return trancheBalance;
}
