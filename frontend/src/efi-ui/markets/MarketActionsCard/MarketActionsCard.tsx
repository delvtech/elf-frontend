import React, { FC } from "react";

import { Card, Classes, Colors, Intent } from "@blueprintjs/core";
import { BigNumber } from "ethers";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { TradePanel } from "efi-ui/crypto/TradePanel/TradePanel";
import { CryptoSymbol } from "efi/crypto/CryptoSymbol";
import { Pool } from "efi/pools/Pool";

interface MarketActionsCardProps {
  pool: Pool;
}

export const MarketActionsCard: FC<MarketActionsCardProps> = ({ pool }) => {
  return (
    <div className={tw("flex", "flex-col", "flex-1", "h-500", "w-3/10")}>
      <div className={tw("mb-2", "space-x-4")}>
        <button style={{ color: Colors.BLUE5 }}>{t`Trade`}</button>
        <button>{t`Stake`}</button>
      </div>
      <Card
        className={tw("flex", "flex-col", "flex-1", "w-full", "transition-all")}
      >
        <TradePanel
          inputLabel={"Trade"}
          buttonLabel={"Trade"}
          buttonIntent={Intent.PRIMARY}
          tradeCryptoSymbol={"ETH"}
          tradeCryptoBalance={{
            value: BigNumber.from(5000000000),
            decimals: BigNumber.from(9),
          }}
          receiveCryptoSymbol={"fyETH" as CryptoSymbol}
          receiveCryptoBalance={{
            value: BigNumber.from(0),
            decimals: BigNumber.from(9),
          }}
          onTransaction={() => {}}
        />
      </Card>
    </div>
  );
};
