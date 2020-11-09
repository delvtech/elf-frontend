import React, { FC, useCallback } from "react";

import { Card, H3, Intent, Tag } from "@blueprintjs/core";

import tw from "efi-tailwindcss-classnames";
import { Strategy } from "efi/pools/strategy";

interface StrategyPreviewCardProps {
  strategy: Strategy;
  onSelectStrategy?: (strategyId: string) => void;
}

export const StrategyPreviewCard: FC<StrategyPreviewCardProps> = ({
  strategy: { name, stakingAsset, id },
  onSelectStrategy,
}) => {
  const selectStrategy = useCallback(() => {
    if (onSelectStrategy) {
      onSelectStrategy(id);
    }
  }, [id, onSelectStrategy]);

  return (
    <Card onClick={selectStrategy} interactive className={tw("flex", "w-full")}>
      <div
        className={tw(
          "flex",
          "sm:flex-col",
          "flex-wrap",
          "justify-between",
          "mb-8",
          "items-center",
          "w-full",
          "space-x-3",
          "sm:space-y-3"
        )}
      >
        {/* Strategy name */}
        <div>
          <H3 className={tw("m-0")}>{name}</H3>
        </div>

        <div className={tw("flex", "flex", "space-x-3", "items-center")}>
          {/* Staking Asset */}
          <Tag minimal intent={Intent.PRIMARY} interactive large>
            {stakingAsset}
          </Tag>
        </div>
      </div>
    </Card>
  );
};
