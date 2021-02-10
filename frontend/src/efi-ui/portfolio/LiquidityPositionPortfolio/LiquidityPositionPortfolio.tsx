import React, { FC } from "react";

import { Card } from "@blueprintjs/core";

import tw from "efi-tailwindcss-classnames";
import { LiquidityPositionTable } from "efi-ui/portfolio/LiquidityPositionTable/LiquidityPositionTable";
import { NoLPsInWalletNonIdealState } from "efi-ui/wallets/NoLPsInWalletNonIdealState/NoLPsInWalletNonIdealState";
import { NoWalletConnectedNonIdealState } from "efi-ui/wallets/NoWalletConnectedNonIdealState/NoWalletConnectedNonIdealState";

interface LiquidityPositionPortfolioProps {
  account: string | null | undefined;
}

export const LiquidityPositionPortfolio: FC<LiquidityPositionPortfolioProps> = ({
  account,
}) => {
  // TODO: check user's wallet for LPs
  const hasLPs = true;

  let nonIdealStateContent = null;
  if (!account) {
    nonIdealStateContent = <NoWalletConnectedNonIdealState />;
  }
  if (!hasLPs) {
    nonIdealStateContent = <NoLPsInWalletNonIdealState />;
  }

  return (
    <Card className={tw("flex-1", "p-8")}>
      {nonIdealStateContent || <LiquidityPositionTable account={account} />}
    </Card>
  );
};
