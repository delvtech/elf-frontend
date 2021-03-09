import { Tranche__factory } from "elf-contracts/types";
import { Currency, Money } from "ts-money";

import { useSmartContractFromFactory } from "efi-ui/contracts/useSmartContractFromFactory/useSmartContractFromFactory";
import { useTrancheFiatBalance } from "efi-ui/markets/useFYTFiatBalance";
import { useCurrencyPref } from "efi-ui/prefs/useCurrency/useCurencyPref";
import ContractAddresses from "efi/contracts/contractsJson";

export function useFiatBalanceAllTranches(
  account: string | null | undefined
): Money | undefined {
  const { currency } = useCurrencyPref();

  const wethTranche = useSmartContractFromFactory(
    ContractAddresses.wethTrancheAddress,
    Tranche__factory.connect
  );

  const wethTrancheFiatBalance = useTrancheFiatBalance(
    account,
    wethTranche,
    currency
  );

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
