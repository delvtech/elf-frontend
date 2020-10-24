import { Card, H3, Intent, Tag } from "@blueprintjs/core";
import { Strategy } from "efi/pools/strategy";
import React, { FC, useCallback } from "react";
import tw from "tailwindcss-classnames";
import { t } from "ttag";

interface StrategyPreviewCardProps {
  strategy: Strategy<any>;
  onSelectStrategy?: (strategyId: string) => void;
}

export const StrategyPreviewCard: FC<StrategyPreviewCardProps> = ({
  strategy: { name, stakingAsset, id, apy },
  onSelectStrategy,
}) => {
  const selectStrategy = useCallback(() => {
    if (onSelectStrategy) {
      onSelectStrategy(id);
    }
  }, [id, onSelectStrategy]);

  return (
    <Card onClick={selectStrategy} interactive className={tw("flex")}>
      <div
        className={tw(
          "flex",
          "flex-wrap",
          "mb-8",
          "items-center",
          "w-full",
          "space-x-3"
        )}
      >
        {/* Strategy name */}
        <div>
          <H3 className={tw("m-0")}>{name}</H3>
        </div>

        {/* Staking Asset */}
        <div className={tw("flex", "flex-col", "space-y-3")}>
          <div>
            <Tag minimal intent={Intent.PRIMARY} interactive large>
              {stakingAsset}
            </Tag>
          </div>
        </div>

        {/* Expected APY */}
        <div className={tw("flex", "flex-col", "space-y-4")}>
          <span>
            {t`Exected APY`} {apy}
          </span>
        </div>
      </div>
    </Card>
  );
};
