import React, { FC, useCallback } from "react";

import {
  Card,
  Classes,
  Colors,
  H3,
  Icon,
  Intent,
  Tag,
} from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { formatEther } from "@ethersproject/units";
import classNames from "classnames";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { Strategy } from "efi/pools/strategy";
import {
  useElfContractSymbol,
  useElfContractTotalSupply,
} from "efi/ui/contracts/useElfContract";
import { useCryptoPrice } from "efi/ui/crypto/hooks/useCryptoPrice/useCryptoPrice";
import { useDarkMode } from "efi/ui/prefs/useDarkMode/useDarkMode";

interface StrategyPreviewCardProps {
  strategy: Strategy;
  onSelectStrategy?: (strategyId: string) => void;

  className?: string;
}

export const StrategyPreviewCard: FC<StrategyPreviewCardProps> = ({
  strategy: { name, stakingAsset, id },
  onSelectStrategy,
  className,
}) => {
  const selectStrategy = useCallback(() => {
    if (onSelectStrategy) {
      onSelectStrategy(id);
    }
  }, [id, onSelectStrategy]);

  const { isDarkMode } = useDarkMode();

  const { data: strategyCryptoSymbol } = useElfContractSymbol();
  const { data: elfTotalSupply } = useElfContractTotalSupply();
  const { data: ethPrice } = useCryptoPrice("ETH");
  let marketCap: number | undefined;
  if (ethPrice !== undefined && elfTotalSupply !== undefined) {
    marketCap = ethPrice * +formatEther(elfTotalSupply);
  }

  return (
    <Card
      onClick={selectStrategy}
      interactive
      className={classNames(tw("flex", "flex-col", "space-y-8"), className)}
    >
      {/* Strategy name */}
      <H3
        className={tw("m-0")}
        style={{ color: isDarkMode ? Colors.BLUE5 : Colors.BLUE2 }}
      >
        {name}
      </H3>

      <div className={tw("flex", "flex-col", "space-y-8")}>
        {/* Summary */}
        <div className={tw("flex", "flex-col", "w-full", "space-y-2")}>
          <span
            className={classNames(tw("text-base"), Classes.TEXT_MUTED)}
          >{t`Summary`}</span>
          <div className={tw("flex", "w-full", "items-center", "space-x-4")}>
            <Tag minimal large intent={Intent.PRIMARY}>
              {stakingAsset}
            </Tag>
            <Icon icon={IconNames.ARROW_RIGHT} />
            <div className={tw("flex", "space-x-2")}>
              {["yDAI", "yUSDC", "yUSDT", "yTUSD"].map((assetName) => (
                <Tag
                  key={assetName}
                  minimal
                  large
                  rightIcon={
                    <span
                      className={classNames(tw("text-xs"), Classes.TEXT_MUTED)}
                    >
                      25%
                    </span>
                  }
                >
                  {assetName}
                </Tag>
              ))}
            </div>
          </div>
        </div>

        {/* Total Supply/Market cap */}
        <div className={tw("flex", "w-full", "justify-between")}>
          <div className={tw("flex", "flex-col")}>
            <span
              className={classNames(tw("text-base"), Classes.TEXT_MUTED)}
            >{t`Total supply`}</span>
            <span className={tw("text-lg")}>
              {elfTotalSupply && formatEther(elfTotalSupply)}{" "}
              {strategyCryptoSymbol}
            </span>
          </div>
          <div className={tw("flex", "flex-col")}>
            <span
              className={classNames(tw("text-base"), Classes.TEXT_MUTED)}
            >{t`Market cap`}</span>
            <span className={tw("text-lg")}>{`$${Number(
              marketCap?.toFixed(2)
            ).toLocaleString()}`}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
