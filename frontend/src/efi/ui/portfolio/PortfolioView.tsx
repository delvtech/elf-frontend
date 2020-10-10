import React, { FC } from "react";
import tw from "tailwindcss-classnames";
import WalletSummary from "efi/ui/wallets/WalletSummary";
import BrushChart from "efi/ui/base/BrushChart/BrushChart";

interface PortfolioViewProps {}
export const PortfolioView: FC<PortfolioViewProps> = () => {
  return (
    <div
      className={tw(
        "flex",
        "flex-col",
        "h-full",
        "w-full",
        "md:justify-center",
        "md:items-center"
      )}
    >
      <WalletSummary />
      <div className={tw("w-full", "h-full", "md:w-1/2", "md:h-64")}>
        <BrushChart width={100} height={80} />
      </div>
    </div>
  );
};
