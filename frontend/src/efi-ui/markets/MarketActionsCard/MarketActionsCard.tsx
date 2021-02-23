import React, { FC, useCallback, useState } from "react";

import { Card, Colors, Intent } from "@blueprintjs/core";
import { BigNumber, Signer } from "ethers";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { TradePanel } from "efi-ui/trade/TradePanel/TradePanel";
import { CryptoSymbol } from "efi/crypto/CryptoSymbol";
import { Market } from "efi/markets/Market";
import { BPool } from "elf-contracts/types/BPool";
import { ERC20 } from "elf-contracts/types/ERC20";

interface MarketActionsCardProps {
  signer: Signer | undefined;
  accountAddress: string | null | undefined;
  market: Market | undefined;
  marketContract: BPool | undefined;
}

type MarketAction = "trade" | "stake";
export const MarketActionsCard: FC<MarketActionsCardProps> = ({
  signer,
  accountAddress,
  market,
  marketContract,
}) => {
  const baseAssetContract = market?.assets[0]?.contract;
  const yieldAssetContract = market?.assets[1]?.contract;

  let assetContracts: [ERC20, ERC20] | undefined;
  if (baseAssetContract && yieldAssetContract) {
    assetContracts = [baseAssetContract, yieldAssetContract];
  }

  const [action, setActionUI] = useState<MarketAction>("trade");
  const showTradeUI = useCallback(() => setActionUI("trade"), []);
  const showStakeUI = useCallback(() => setActionUI("stake"), []);

  return (
    <div className={tw("flex", "flex-col", "flex-1", "h-500", "w-3/10")}>
      <div className={tw("mb-2", "space-x-4")}>
        <button
          aria-label="trade"
          onClick={showTradeUI}
          style={{ color: Colors.BLUE5 }}
        >{t`Trade`}</button>
        <button onClick={showStakeUI} aria-label="stake">{t`Stake`}</button>
      </div>
      <Card
        className={tw("flex", "flex-col", "flex-1", "w-full", "transition-all")}
      >
        {action === "trade" && (
          <TradePanel
            assetContracts={assetContracts}
            signer={signer}
            accountAddress={accountAddress}
            marketContractWithSigner={marketContract}
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
        )}
        {action === "stake" && (
          <TradePanel
            assetContracts={assetContracts}
            signer={signer}
            accountAddress={accountAddress}
            marketContractWithSigner={marketContract}
            inputLabel={"Stake"}
            buttonLabel={"Stake"}
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
        )}
      </Card>
    </div>
  );
};
