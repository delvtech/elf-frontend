import { formatEther } from "ethers/lib/utils";
import React, { FC } from "react";

import { PieChart, PieData } from "efi-ui/charts/PieChart/PieChart";
import { useElfContractBalance } from "efi-ui/graveyard/pools/hooks/useElfContract";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { getQueryCombinedStatus } from "efi-ui/query/getQueryCombinedStatus";
import { useWallet } from "efi-ui/wallets/hooks/useWallet";
import { useWalletBalances } from "efi-ui/wallets/hooks/useWalletBalance";
import { formatCurrency } from "efi/base/formatCurrency/formatCurrency";

interface WalletBalancesPieChartProps {}

export const WalletBalancesPieChart: FC<WalletBalancesPieChartProps> = () => {
  const { isDarkMode } = useDarkMode();

  const { accountAddress: account } = useWallet();
  const [balances, balancesResult] = useWalletBalances();
  const balancesLoading = getQueryCombinedStatus(balancesResult) === "loading";

  const ethBalance = balances.ETH ? formatEther(balances.ETH.value) : "0";
  const elf = useElfContractBalance(account);
  const elfBalance = formatCurrency(elf?.value, elf?.decimals.toNumber());

  const tokens: PieData[] = [
    {
      name: "Eth",
      value: Number(ethBalance),
    },
    {
      name: "ELF-1",
      value: Number(elfBalance),
      subData: [
        { name: "yDAI", value: 100 },
        { name: "yUSDC", value: 300 },
        { name: "yUSDT", value: 150 },
        { name: "yTUSD", value: 150 },
      ],
    },
  ];

  if (balancesLoading) {
    return null;
  }

  return <PieChart isDarkMode={isDarkMode} pieData={tokens} />;
};
