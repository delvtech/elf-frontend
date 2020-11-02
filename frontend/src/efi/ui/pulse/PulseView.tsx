import React, { FC, useState } from "react";

import { Card, Tab, Tabs } from "@blueprintjs/core";
import { RouteComponentProps } from "@reach/router";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import BrushChart from "efi/ui/charts/BrushChart/BrushChart";
import { PieChart } from "efi/ui/charts/PieChart/PieChart";
import { useDarkMode } from "efi/ui/prefs/useDarkMode/useDarkMode";

interface PulseViewProps extends RouteComponentProps {}

enum PulseTab {
  ALL_MARKETS = "all-markets",
  WALLET = "current-wallet",
  GOVERNANCE = "governance",
}
export const PulseView: FC<PulseViewProps> = () => {
  const { isDarkMode } = useDarkMode();
  const [activePulse, setActivePulse] = useState<PulseTab>(
    PulseTab.ALL_MARKETS
  );
  return (
    <div
      className={tw(
        "flex",
        "flex-col",
        "h-full",
        "w-full",
        "p-8",
        "space-y-4",
        "lg:flex-row",
        "lg:flex-wrap",
        "lg:overflow-scroll"
      )}
    >
      <div className={tw("pb-4", "flex", "items-center")}>
        <Tabs
          large
          selectedTabId={activePulse}
          onChange={(tabId: PulseTab) => setActivePulse(tabId)}
          className={tw("flex", "w-full", "justify-center")}
        >
          <Tab id={PulseTab.WALLET}>{t`My portfolio`}</Tab>
          <Tab id={PulseTab.ALL_MARKETS}>{t`All strategies`}</Tab>
          <Tab id={PulseTab.GOVERNANCE}>{t`Governance`}</Tab>
        </Tabs>
      </div>

      <div
        className={tw(
          "flex",
          "flex-col",
          "h-full",
          "w-full",
          "space-y-4",
          "lg:h-auto",
          "lg:min-h-1/4",
          "lg:flex-row",
          "lg:space-y-0",
          "lg:space-x-4",
          "lg:pb-4"
        )}
      >
        <Card
          className={tw(
            "flex",
            "h-64",
            "justify-center",
            "items-center",
            "flex-1",
            "lg:min-h-1/2",
            "lg:h-auto"
          )}
        >
          {activePulse === PulseTab.ALL_MARKETS ? (
            <BrushChart compact isDarkMode={isDarkMode} />
          ) : (
            <PieChart isDarkMode={isDarkMode} />
          )}
        </Card>

        <Card
          className={tw(
            "flex",
            "h-64",
            "justify-center",
            "items-center",
            "flex-1",
            "lg:min-h-1/2",
            "lg:h-auto"
          )}
        >
          {activePulse === PulseTab.ALL_MARKETS ? (
            <PieChart isDarkMode={isDarkMode} />
          ) : (
            <BrushChart compact isDarkMode={isDarkMode} />
          )}
        </Card>
      </div>

      <Card
        className={tw(
          "flex",
          "h-64",
          "justify-center",
          "items-center",
          "flex-1",
          "lg:min-h-1/2"
        )}
      >
        <BrushChart isDarkMode={isDarkMode} />
      </Card>
    </div>
  );
};
