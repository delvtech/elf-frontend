import React, { FC, SVGProps, useState } from "react";

import { Button, Card, Classes, H4, InputGroup, Tag } from "@blueprintjs/core";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";

import styles from "efi-ui/mint/ChooseBaseAssetStep/styles.module.css";

import { YieldPositionPicker } from "./YieldPositionPicker";
import classNames from "classnames";

export interface BaseAssetCardProps {
  id: string;
  assetIcon: FC<SVGProps<SVGSVGElement> & { title?: string }>;

  assetName: string;
  assetSymbol: string;

  assetPrice: string;
  yieldPositions: { id: string; name: string; apy: string }[];
  walletBalance: string;
  walletBalanceFiat: string;
  onInvestmentAmountChange: (amount: number) => void;
}

export const BaseAssetCard: FC<BaseAssetCardProps> = ({
  assetName,
  assetIcon: AssetIcon,
  assetSymbol,
  assetPrice,
  walletBalance,
  walletBalanceFiat,
  yieldPositions,
}) => {
  const [activeYieldPositionIndex, setActiveYieldPositionIndex] = useState(0);
  const activeYieldPosition = yieldPositions[activeYieldPositionIndex];
  return (
    <Card
      key={assetName}
      className={tw(
        "flex",
        "flex-col",
        "p-10",
        "space-y-10",
        "w-full",
        "flex-1"
      )}
    >
      <div className={tw("flex", "w-full", "space-x-4")}>
        <div>
          <AssetIcon height={50} width={50} />
        </div>
        <div>
          <H4>{assetName}</H4>
          <span
            className={Classes.TEXT_LARGE}
          >{t`1 ${assetSymbol} = ${assetPrice}`}</span>
        </div>
      </div>

      <div className={tw("flex", "w-full", "justify-between")}>
        <div className={tw("grid", "grid-cols-2", "w-full")}>
          <span>{t`Amount to invest:`}</span>
          <div className={tw("space-y-2")}>
            <div className={tw("flex", "space-x-2")}>
              <InputGroup
                large
                fill
                className={classNames(styles.inputWithIcon)}
                leftElement={
                  <div className={tw("flex", "items-center", "px-2")}>
                    <AssetIcon height={18} width={18} />
                  </div>
                }
                placeholder="0.00"
                rightElement={<Tag minimal>{assetSymbol}</Tag>}
              />
            </div>
            <div className={tw("flex", "w-full", "justify-between")}>
              <div
                className={tw(
                  "flex",
                  "justify-between",
                  "w-full",
                  "items-center"
                )}
              >
                <span>{t`Available balance:`}</span>{" "}
                <div className={tw("space-x-1")}>
                  <span>{`${walletBalance} ${assetSymbol}`}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <YieldPositionPicker
        yieldPositions={yieldPositions}
        setActiveYieldPositionIndex={setActiveYieldPositionIndex}
        activeYieldPosition={activeYieldPosition}
      />

      <div className={tw("flex", "w-full", "justify-end", "pt-10")}>
        <Button fill outlined large>
          {t`Continue with ${assetSymbol}`}
        </Button>
      </div>
    </Card>
  );
};
