import React, { FC, useMemo } from "react";

import { Card } from "@blueprintjs/core";

import tw from "efi-tailwindcss-classnames";
import BrushChart, { TimeData } from "efi-ui/charts/BrushChart/BrushChart";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { useTokenData } from "efi-ui/pulse/hook/useTokenData/useTokenData";
import { WalletBalancesPieChart } from "efi-ui/wallets/WalletBalancesPieChart/WalletBalancesPieChart";
import { THIRTY_DAYS_IN_SECONDS } from "efi/base/time";
import { UNI_CONTRACT_ADDRESS_MAINNET } from "efi/crypto/TokenContractAddresses";

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
  // go back 5 minutes from now to make sure there is block data, we can probably get this closer to
  // 1 minute but this is good for now
  const nowInSeconds = useMemo(
    () => Math.round(Date.now() / 1000) - 60 * 5,
    []
  );

  // requires time in seconds, returns time in milliseconds
  const { data: tokenData } = useTokenData(
    UNI_CONTRACT_ADDRESS_MAINNET,
    nowInSeconds - THIRTY_DAYS_IN_SECONDS,
    nowInSeconds
  );

  const data: TimeData[] = useMemo(() => {
    if (!tokenData) {
      return [];
    }
    return tokenData.map(({ timeMs, derivedUSD }) => ({
      timeMs,
      value: derivedUSD,
    }));
  }, [tokenData]);

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

const getYValue = (d: TimeData) => d.value;

const getXValue = (d: TimeData) => new Date(d.timeMs);
