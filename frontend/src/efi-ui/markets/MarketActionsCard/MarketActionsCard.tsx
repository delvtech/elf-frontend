import React, { FC } from "react";

import { Card, Colors, Intent } from "@blueprintjs/core";
import { BigNumber } from "ethers";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { TradePanel } from "efi-ui/crypto/TradePanel/TradePanel";
import { CryptoSymbolOld } from "efi/crypto/CryptoSymbol";
import { Market } from "efi/markets/Market";

interface MarketActionsCardProps {
  market: Market;
}

export const MarketActionsCard: FC<MarketActionsCardProps> = ({ market }) => {
  return (
    <div className={tw("flex", "flex-col", "flex-1", "h-500", "w-3/10")}>
      <div className={tw("mb-2", "space-x-4")}>
        <button
          aria-label="trade"
          style={{ color: Colors.BLUE5 }}
        >{t`Trade`}</button>
        <button aria-label="stake">{t`Stake`}</button>
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
          receiveCryptoSymbol={"fyETH" as CryptoSymbolOld}
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
