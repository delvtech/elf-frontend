import { RouteComponentProps } from "@reach/router";
import BrushChart from "efi/ui/base/BrushChart/BrushChart";
import { PieChart } from "efi/ui/base/PieChart/PieChart";
import { useWallet } from "efi/ui/wallets/hooks/useWallet";
import { MissingWalletEmptyState } from "efi/ui/wallets/MissingWalletEmptyState/MissingWalletEmptyState";
import WalletSummary from "efi/ui/wallets/WalletSummary";
import React, { FC } from "react";
import tw from "tailwindcss-classnames";

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
        "h-full",
        "w-full",
        "grid",
        "grid-cols-1",
        "sm:grid-cols-2",
        "gap-4",
        "py-4"
      )}
    >
      <div className={tw("md:justify-center", "md:items-center", "px-4")}>
        <WalletSummary />
      </div>
      <div className={tw("justify-center", "items-center", "px-4")}>
        <BrushChart />
      </div>
      <div className={tw("md:justify-center", "md:items-center", "px-4")}>
        <PieChart width={300} height={300} />
      </div>
      <div className={tw("justify-center", "items-center", "px-4")}>
        <BrushChart />
      </div>
    </div>
  );
};
