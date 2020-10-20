import { RouteComponentProps } from "@reach/router";
import { ElfStrategyLowRisk } from "efi/pools/lowRisk";
import { useWallet } from "efi/ui/wallets/hooks/useWallet";
import { MissingWalletEmptyState } from "efi/ui/wallets/MissingWalletEmptyState/MissingWalletEmptyState";
import React, { FC } from "react";
import tw from "tailwindcss-classnames";
import { StrategyCard } from "../pools/StrategyCard/StrategyCard";

interface InvestViewProps extends RouteComponentProps {}

const investViewClassName = tw(
  "flex",
  "flex-col",
  "h-full",
  "w-full",
  "md:justify-center",
  "md:items-center"
);

const availableStrategies = [ElfStrategyLowRisk];

export const InvestView: FC<InvestViewProps> = () => {
  const { account } = useWallet();

  if (!account) {
    return <MissingWalletEmptyState />;
  }

  return (
    <div className={investViewClassName}>
      {availableStrategies.map((strategy) => {
        return <StrategyCard strategy={strategy} />;
      })}
    </div>
  );
};
