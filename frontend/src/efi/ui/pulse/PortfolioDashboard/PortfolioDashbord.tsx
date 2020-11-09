import React, { FC } from "react";

import { Card } from "@blueprintjs/core";

import tw from "efi-tailwindcss-classnames";
import BrushChart from "efi/ui/charts/BrushChart/BrushChart";
import { useDarkMode } from "efi/ui/prefs/useDarkMode/useDarkMode";
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
