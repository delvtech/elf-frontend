import React, { FC } from "react";

import { RouteComponentProps } from "@reach/router";
import tw from "tailwindcss-classnames";

import BrushChart from "efi/ui/charts/BrushChart/BrushChart";
import { PieChart } from "efi/ui/charts/PieChart/PieChart";
import { useWallet } from "efi/ui/wallets/hooks/useWallet";
import { MissingWalletEmptyState } from "efi/ui/wallets/MissingWalletEmptyState/MissingWalletEmptyState";

interface PortfolioViewProps extends RouteComponentProps {}
export const PortfolioView: FC<PortfolioViewProps> = () => {
  const { account } = useWallet();

  if (!account) {
    return <MissingWalletEmptyState />;
  }

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
        "gap-4",
        "py-4"
      )}
    >
      <div className={tw("md:justify-center", "md:items-center", "px-4")} />
      <div className={tw("justify-center", "items-center", "px-4")}>
        <BrushChart />
      </div>
      <div className={tw("justify-center", "items-center", "px-4")}>
        <PieChart background />
      </div>
      <div className={tw("justify-center", "items-center", "px-4")}>
        <BrushChart />
      </div>
    </div>
  );
};
