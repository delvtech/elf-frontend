import React, { FC } from "react";

import { formatEther } from "ethers/lib/utils";

import { PieChart, PieData } from "efi/ui/charts/PieChart/PieChart";
import { useElfContractBalance } from "efi/ui/contracts/useElfContract";
import { useDarkMode } from "efi/ui/prefs/useDarkMode/useDarkMode";
import { useWalletBalance } from "efi/ui/wallets/hooks/useWalletBalance";

interface WalletBalancesPieChartProps {}

export const WalletBalancesPieChart: FC<WalletBalancesPieChartProps> = () => {
  const { isDarkMode } = useDarkMode();

  const balance = useWalletBalance();
  const ethBalance = balance.data ? formatEther(balance.data) : "0";
  const contractBalance = useElfContractBalance();
  const elfBalance = contractBalance.data
    ? formatEther(contractBalance.data)
    : "0";

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

  return <PieChart isDarkMode={isDarkMode} pieData={tokens} />;
};
