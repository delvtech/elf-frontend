import { useFYTFiatBalance } from "efi-ui/markets/useFYTFiatBalance";
import ContractAddresses from "efi/contracts/contractsJson";

export function useTotalFYTFiatBalance(account: string | null | undefined) {
  const fytWethFiatBalance = useFYTFiatBalance(
    account,
    ContractAddresses.trancheWethAddress,
    ContractAddresses.bPoolWethAddress,
    ContractAddresses.wethAddress
  );

  const fyUsdcFiatBalance = useFYTFiatBalance(
    account,
    ContractAddresses.trancheUsdcAddress,
    ContractAddresses.bPoolUsdcAddress,
    ContractAddresses.usdcAddress
  );

  const totalFiatBalance = calculateTotalFiatBalance(
    fytWethFiatBalance,
    fyUsdcFiatBalance
  );

  return totalFiatBalance;
}

function calculateTotalFiatBalance(
  fytWethFiatBalance: number | undefined,
  fyUsdcFiatBalance: number | undefined
) {
  const fytsWithBalance: number[] = [];

  [fytWethFiatBalance, fyUsdcFiatBalance].forEach((balance) => {
    if (balance === undefined) {
      return;
    }
    if (balance > 0) {
      fytsWithBalance.push(balance);
    }
  });

  const totalFiatValue = fytsWithBalance.reduce(
    (balance, sum) => (balance || 0) + sum,
    0
  );
  return totalFiatValue;
}
