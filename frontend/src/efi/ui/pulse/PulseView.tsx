import React, { FC } from "react";

import { RouteComponentProps } from "@reach/router";
import tw from "efi-tailwindcss-classnames";

import BrushChart from "efi/ui/charts/BrushChart/BrushChart";
import { PieChart } from "efi/ui/charts/PieChart/PieChart";
import { useDarkMode } from "efi/ui/prefs/useDarkMode/useDarkMode";
import { Card } from "@blueprintjs/core";

interface PulseViewProps extends RouteComponentProps {}
export const PulseView: FC<PulseViewProps> = () => {
  const { isDarkMode } = useDarkMode();
  return (
    <div
      className={tw(
        "flex",
        "flex-wrap",
        "h-full",
        "w-full",
        "grid",
        "grid-cols-1",
        "md:grid-cols-2",
        "grid-rows-none",
        "md:grid-rows-2",
        "gap-6",
        "p-8"
      )}
    >
      <div className={tw("md:justify-center", "md:items-center")} />
      <Card className={tw("justify-center", "items-center")}>
        <BrushChart isDarkMode={isDarkMode} />
      </Card>

      <Card className={tw("justify-center", "items-center")}>
        <PieChart isDarkMode={isDarkMode} />
      </Card>

      <Card className={tw("justify-center", "items-center")}>
        <BrushChart isDarkMode={isDarkMode} />
      </Card>
    </div>
  );
};
