import { Currency, Money } from "ts-money";

import { useTrancheFiatBalance } from "efi-ui/markets/useFYTFiatBalance";
import ContractAddresses from "efi/contracts/contractsJson";
import { useCurrencyPref } from "efi-ui/prefs/useCurrency/useCurencyPref";

export function useFiatBalanceAllTranches(
  account: string | null | undefined
): Money | undefined {
  const { currency } = useCurrencyPref();
  const wethTrancheFiatBalance = useTrancheFiatBalance(
    account,
    ContractAddresses.wethTrancheAddress,
    ContractAddresses.marketFyWethAddress,
    ContractAddresses.wethAddress
  );

  // TODO: Uncomment this once the usdc contracts are deployed to the testnet
  // const usdcTrancheFiatBalance = useTrancheFiatBalance(
  //   account,
  //   ContractAddresses.trancheUsdcAddress,
  //   ContractAddresses.bPoolUsdcAddress,
  //   ContractAddresses.usdcAddress
  // );

  const totalFiatBalance = calculateTotalFiatBalance(
    [
      wethTrancheFiatBalance,
      // TODO: Uncomment this once the usdc contracts are deployed to the testnet
      // usdcTrancheFiatBalance,
    ],
    currency
  );

  return totalFiatBalance;
}

function calculateTotalFiatBalance(
  fiatBalances: (Money | undefined)[],
  currency: Currency
): Money | undefined {
  const tranchesWithBalance: Money[] = fiatBalances.filter(
    (balance): balance is Money => {
      return balance !== undefined;
    }
  );

  if (!tranchesWithBalance.length) {
    return undefined;
  }

  const totalFiatBalance = tranchesWithBalance.reduce((balance, total) => {
    return total.add(balance);
  }, Money.fromDecimal(0, currency));

  return totalFiatBalance;
}
