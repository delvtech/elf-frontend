import { Card, H3 } from "@blueprintjs/core";
import { RouteComponentProps } from "@reach/router";
import { useWallet } from "efi/ui/wallets/hooks/useWallet";
import { MissingWalletEmptyState } from "efi/ui/wallets/MissingWalletEmptyState/MissingWalletEmptyState";
import React, { FC } from "react";
import tw from "tailwindcss-classnames";
import { t } from "ttag";

interface InvestViewProps extends RouteComponentProps {}

const investViewClassName = tw(
  "flex",
  "flex-col",
  "h-full",
  "w-full",
  "md:justify-center",
  "md:items-center"
);

export const InvestView: FC<InvestViewProps> = () => {
  const { account } = useWallet();

  if (!account) {
    return <MissingWalletEmptyState />;
  }

  return (
    <div className={investViewClassName}>
      <Card className={tw("flex", "flex-col", "items-center")}>
        <div className={tw("flex", "gap-4")}>
          <span className={tw("text-6xl")}>⛰</span>
          <div className={tw("flex", "flex-col")}>
            <H3>{t`Liquid pool`}</H3>
          </div>
        </div>
      </Card>
    </div>
  );
};
