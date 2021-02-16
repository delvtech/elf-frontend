import { BigNumber } from "ethers";

import { useTokenBalanceOf } from "efi-ui/token/hooks/useTokenBalanceOf";
import { useTrancheContract } from "efi-ui/tranche/useTrancheContract";
import ContractAddresses from "efi/contracts/contractsJson";
import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";

export function useTranchesWithBalance(account: string | null | undefined) {
  const wethTrancheContract = useTrancheContract(
    ContractAddresses.trancheWethAddress,
    jsonRpcProvider
  );
  const [wethTrancheBalance] = useTokenBalanceOf(wethTrancheContract, account);

  const usdcTrancheContract = useTrancheContract(
    ContractAddresses.trancheUsdcAddress,
    jsonRpcProvider
  );
  const [usdcTrancheBalance] = useTokenBalanceOf(usdcTrancheContract, account);

  const tranchesWithBalance = [wethTrancheBalance, usdcTrancheBalance].filter(
    (balance): balance is BigNumber => {
      if (!balance) {
        return false;
      }
      return balance.gt(0);
    }
  );

  return tranchesWithBalance;
}
