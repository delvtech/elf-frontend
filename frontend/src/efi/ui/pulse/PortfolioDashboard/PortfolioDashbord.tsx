import React, { FC, useState } from "react";

import { Card } from "@blueprintjs/core";

import tw from "efi-tailwindcss-classnames";
import { UNI_CONTRACT_ADDRESS_MAINNET } from "efi/crypto/erc20";
import BrushChart, { TimeData } from "efi/ui/charts/BrushChart/BrushChart";
import { useDarkMode } from "efi/ui/prefs/useDarkMode/useDarkMode";
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
const thirtyDays = 60 * 60 * 24 * 30;
export const PortfolioDashboard: FC<PortfolioDashboardProps> = () => {
  const { isDarkMode } = useDarkMode();
  const [now] = useState(Math.round(Date.now() / 1000 - thirtyDays));

  // requires time in seconds
  const { data: tokenData } = useTokenData(
    UNI_CONTRACT_ADDRESS_MAINNET,
    now - thirtyDays,
    now
  );

  // requires time in ms
  let data: TimeData[] = [];
  if (tokenData) {
    data = tokenData.map(({ timestamp, derivedUSD }) => ({
      time: timestamp,
      value: derivedUSD,
    }));
  }

  return (
    <div className={portfolioDashboardClassName}>
      <div className={firstRowClassName}>
        <Card className={firstRowCardClassName}>
          <WalletBalancesPieChart />
        </Card>

        <Card className={firstRowCardClassName}>
          {!!data.length && (
            <BrushChart
              getXValue={getXValue}
              getYValue={getYValue}
              data={data}
              isDarkMode={isDarkMode}
            />
          )}
        </Card>
      </div>

      <Card className={bottomRowClassName}>
        {!!data.length && (
          <BrushChart
            getXValue={getXValue}
            getYValue={getYValue}
            data={data}
            isDarkMode={isDarkMode}
          />
        )}
      </Card>
    </div>
  );
};

// accessors
const getXValue = (d: any) => {
  const date = new Date(d.time);
  return date;
};
const getYValue = (d: any) => d.value;
