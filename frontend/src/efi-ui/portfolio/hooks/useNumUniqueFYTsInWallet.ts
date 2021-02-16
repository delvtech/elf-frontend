import { useFYTBalance } from "efi-ui/tranche/useFYTBalance";
import ContractAddresses from "efi/contracts/contractsJson";

export function useNumUniqueFYTsInWallet(account: string | null | undefined) {
  const fyWethBalance = useFYTBalance(
    account,
    ContractAddresses.trancheWethAddress
  );

  const fyUsdcBalance = useFYTBalance(
    account,
    ContractAddresses.trancheUsdcAddress
  );

  const uniqueFYTs = [fyWethBalance, fyUsdcBalance].filter(
    (balance) => balance > 0
  );
  return uniqueFYTs.length;
}
