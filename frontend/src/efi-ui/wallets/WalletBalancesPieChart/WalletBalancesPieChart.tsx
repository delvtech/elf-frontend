import React, { FC } from "react";

import { formatEther } from "ethers/lib/utils";

import { PieChart, PieData } from "efi-ui/charts/PieChart/PieChart";
import { useElfContractBalance } from "efi-ui/contracts/useElfContract";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { useWallet } from "efi-ui/wallets/hooks/useWallet";
import { getFormattedBalance } from "efi/crypto/balance";

interface WalletBalancesPieChartProps {}

export const WalletBalancesPieChart: FC<WalletBalancesPieChartProps> = () => {
  const { isDarkMode } = useDarkMode();

  const { balances, account } = useWallet();
  const ethBalance = balances.ETH ? formatEther(balances.ETH.value) : "0";
  const elfBalanceInfo = useElfContractBalance(account);
  const elfBalance = getFormattedBalance(elfBalanceInfo);

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
