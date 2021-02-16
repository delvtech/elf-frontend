import { Currency, Money } from "ts-money";

import { useTrancheFiatBalance } from "efi-ui/markets/useFYTFiatBalance";
import ContractAddresses from "efi/contracts/contractsJson";
import { useCurrencyPref } from "efi-ui/prefs/useCurrency/useCurencyPref";

export function useFiatBalanceAllTranches(account: string | null | undefined) {
  const { currency } = useCurrencyPref();
  const wethTrancheFiatBalance = useTrancheFiatBalance(
    account,
    ContractAddresses.trancheWethAddress,
    ContractAddresses.bPoolWethAddress,
    ContractAddresses.wethAddress
  );

  const usdcTrancheFiatBalance = useTrancheFiatBalance(
    account,
    ContractAddresses.trancheUsdcAddress,
    ContractAddresses.bPoolUsdcAddress,
    ContractAddresses.usdcAddress
  );

  const totalFiatBalance = calculateTotalFiatBalance(
    wethTrancheFiatBalance,
    usdcTrancheFiatBalance,
    currency
  );

  return totalFiatBalance;
}

function calculateTotalFiatBalance(
  wethTrancheFiatBalance: Money | undefined,
  usdcTrancheFiatBalance: Money | undefined,
  currency: Currency
): Money | undefined {
  const tranchesWithBalance: Money[] = [
    wethTrancheFiatBalance,
    usdcTrancheFiatBalance,
  ].filter((balance): balance is Money => {
    return balance !== undefined;
  });

  if (!tranchesWithBalance.length) {
    return undefined;
  }

  const totalFiatBalance = tranchesWithBalance.reduce((balance, total) => {
    return total.add(balance);
  }, Money.fromDecimal(0, currency));

  return totalFiatBalance;
}
