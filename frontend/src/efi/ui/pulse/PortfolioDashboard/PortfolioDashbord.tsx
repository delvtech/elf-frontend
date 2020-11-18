import React, { FC, useState } from "react";

import { Card } from "@blueprintjs/core";

import tw from "efi-tailwindcss-classnames";
import { UNI_CONTRACT_ADDRESS_MAINNET } from "efi/crypto/erc20";
import BrushChart from "efi/ui/charts/BrushChart/BrushChart";
import { useDarkMode } from "efi/ui/prefs/useDarkMode/useDarkMode";
import { useMarketData } from "efi/ui/pulse/hook/useMarketData/useMarketData";
import { useTokenData } from "efi/ui/pulse/hook/useTokenData/useTokenData";
import { WalletBalancesPieChart } from "efi/ui/wallets/WalletBalancesPieChart/WalletBalancesPieChart";

const portfolioDashboardClassName = tw(
  "flex",
  "flex-col",
  "h-full",
  "w-full",
  "space-y-6",
  "lg:flex-row",
  "lg:flex-wrap"
);

const firstRowClassName = tw(
  "flex",
  "h-full",
  "w-full",
  "flex-col", // first row stacks on mobile
  "space-y-6",
  "lg:flex-row", // then expands to two-column on desktop
  "lg:max-h-1/2",
  "lg:space-y-0",
  "lg:space-x-6"
);

const firstRowCardClassName = tw(
  "flex",
  "justify-center",
  "items-center",
  "flex-1"
);
const bottomRowClassName = tw(
  "flex",
  "w-full",
  "justify-center",
  "items-center",
  "flex-1",
  "lg:max-h-1/2"
);

interface PortfolioDashboardProps {}
export const PortfolioDashboard: FC<PortfolioDashboardProps> = () => {
  const { isDarkMode } = useDarkMode();
  const { data: marketData } = useMarketData();
  const [now] = useState(Math.round(Date.now() / 1000 - 60));
  console.log("marketData", marketData);

  const twelveHours = 60 * 60 * 24;
  const { data: tokenData } = useTokenData(
    UNI_CONTRACT_ADDRESS_MAINNET,
    now - twelveHours,
    now
  );
  console.log("tokenData", tokenData);

  return (
    <div className={portfolioDashboardClassName}>
      <div className={firstRowClassName}>
        <Card className={firstRowCardClassName}>
          <WalletBalancesPieChart />
        </Card>

        <Card className={firstRowCardClassName}>
          <BrushChart compact isDarkMode={isDarkMode} />
        </Card>
      </div>

      <Card className={bottomRowClassName}>
        <BrushChart isDarkMode={isDarkMode} />
      </Card>
    </div>
  );
};
