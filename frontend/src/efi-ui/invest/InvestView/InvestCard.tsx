import React, { FC, useState } from "react";

import { Button, Callout, Card, Intent } from "@blueprintjs/core";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { BaseAssetPicker } from "efi-ui/invest/BaseAssetPicker/BaseAssetPicker";
import { useActiveBaseAsset } from "efi-ui/invest/hooks/useActiveBaseAsset";
import { useActiveYieldPosition } from "efi-ui/invest/hooks/useActiveYieldPosition";
import {
  YieldPosition,
  YieldPositionPicker,
} from "efi-ui/invest/InvestView/YieldPositionPicker";
import { BaseAsset } from "efi-ui/invest/types/BaseAsset";

import { InvestmentAmountInput } from "./InvestmentAmountInput";

export interface InvestCardProps {
  baseAssets: BaseAsset[];

  yieldPositions: YieldPosition[];
}

export const InvestCard: FC<InvestCardProps> = ({
  baseAssets,
  yieldPositions,
}) => {
  const {
    activeBaseAsset: { id: activeBaseAssetId, symbol: activeBaseAssetSymbol },
    setActiveBaseAsset,
  } = useActiveBaseAsset(baseAssets);
  const activeBaseAssetBalance = 12.34;

  const {
    activeYieldPosition,
    setActiveYieldPosition,
  } = useActiveYieldPosition(yieldPositions, activeBaseAssetSymbol);

  // investment amount
  const [investmentAmount, setInvestmentAmount] = useState<string | undefined>(
    undefined
  );

  const investmentAmountAsNumber = +(investmentAmount || 0);
  const costPerInvestmentToken =
    investmentAmountAsNumber +
    investmentAmountAsNumber * (activeYieldPosition.apy / 100);

  return (
    <Card className={tw("flex", "flex-col", "p-10", "space-y-10", "flex-1")}>
      <div
        className={tw(
          "flex",
          "space-x-1",
          "h-24",
          "border",
          "rounded",
          "border-gray-500"
        )}
      >
        <InvestmentAmountInput
          baseAssetPicker={
            <BaseAssetPicker
              baseAssets={baseAssets}
              activeBaseAssetId={activeBaseAssetId}
              onBaseAssetChange={setActiveBaseAsset}
            />
          }
          placeholder="0.00"
          value={investmentAmount}
          onValueChange={setInvestmentAmount}
          assetBalance={activeBaseAssetBalance}
        />
      </div>

      <div className={tw("flex", "space-x-10")}>
        <YieldPositionPicker
          yieldPositions={yieldPositions}
          onYieldPositionChange={({ id }) => setActiveYieldPosition(id)}
          activeYieldPositionId={activeYieldPosition.id}
        />
        <Button large outlined intent={Intent.PRIMARY} className={tw("w-1/3")}>
          <div className={tw("p-4", "text-lg")}>{t`Buy`}</div>
        </Button>
      </div>

      {!!investmentAmount && (
        <Callout icon={null} intent={Intent.SUCCESS} className={tw("p-6")}>
          <div className={tw("flex", "w-full", "space-x-4", "justify-between")}>
            <div className={tw("flex", "space-x-4", "items-center", "text-lg")}>
              <LabeledText
                text={t`${activeYieldPosition.apy - 2}%`}
                label={
                  <div className={tw("flex", "justify-center")}>
                    {/* <Tooltip
                      content="asdf"
                      className={classNames(
                        tw("flex", "mr-1"),
                        styles.remainingYield
                      )}
                      popoverClassName={tw("flex")}
                    >
                      <Icon icon={IconNames.INFO_SIGN} iconSize={12} />
                    </Tooltip> */}
                    <span>{t`Estimated yield`}</span>
                  </div>
                }
              />
            </div>
            <div className={tw("flex", "space-x-4", "items-center", "text-lg")}>
              <LabeledText
                text={`${costPerInvestmentToken} ${activeBaseAssetSymbol}`}
                label={"Redeemable at maturity"}
              />
            </div>
          </div>
        </Callout>
      )}
    </Card>
  );
};
