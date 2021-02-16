import { Currency, Money } from "ts-money";

import { useFYTFiatBalance } from "efi-ui/markets/useFYTFiatBalance";
import ContractAddresses from "efi/contracts/contractsJson";
import { useCurrencyPref } from "efi-ui/prefs/useCurrency/useCurencyPref";

export function useTotalFYTFiatBalance(account: string | null | undefined) {
  const { currency } = useCurrencyPref();
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
    fyUsdcFiatBalance,
    currency
  );

  return totalFiatBalance;
}

function calculateTotalFiatBalance(
  fytWethFiatBalance: Money | undefined,
  fyUsdcFiatBalance: Money | undefined,
  currency: Currency
): Money | undefined {
  const fytsWithBalance: Money[] = [
    fytWethFiatBalance,
    fyUsdcFiatBalance,
  ].filter((balance): balance is Money => {
    return balance !== undefined;
  });

  if (!fytsWithBalance.length) {
    return undefined;
  }

  const totalFiatBalance = fytsWithBalance.reduce((balance, total) => {
    return total.add(balance);
  }, Money.fromDecimal(0, currency));

  return totalFiatBalance;
}
