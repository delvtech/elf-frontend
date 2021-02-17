import React, { FC } from "react";

import { Classes, Colors, Icon, Tag } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Select } from "@blueprintjs/select";
import classNames from "classnames";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { CryptoSymbolOld } from "efi/crypto/CryptoSymbol";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";

export interface YieldPosition {
  id: string;
  name: string;
  symbol: string;
  apy: number;
  maturity: string;
  baseAssetSymbol: CryptoSymbolOld;
}
interface YieldPositionPickerProps {
  yieldPositions: YieldPosition[];
  activeYieldPositionId: string;
  onYieldPositionChange: (newYieldPosition: YieldPosition) => void;
}
export const YieldPositionPicker: FC<YieldPositionPickerProps> = ({
  yieldPositions,
  onYieldPositionChange,
  activeYieldPositionId,
}) => {
  const {
    apy: activeYieldPositionAPY,
    maturity: activeYieldPositionMaturity,
    symbol: activeYieldPositionSymbol,
    name: activeYieldPositionName,
  } = yieldPositions.find(
    ({ id }) => activeYieldPositionId === id
  ) as YieldPosition;

  return (
    <Select
      disabled
      popoverProps={{ minimal: true, targetClassName: tw("w-full") }}
      items={yieldPositions}
      filterable={false}
      className={tw("w-full", "col-span-2")}
      itemRenderer={({ name, apy, symbol, maturity }, { handleClick }) => (
        <YieldPositionButton
          name={name}
          apy={apy}
          symbol={symbol}
          maturity={maturity}
          onClick={handleClick}
        />
      )}
      onItemSelect={onYieldPositionChange}
    >
      <YieldPositionButton
        name={activeYieldPositionName}
        symbol={activeYieldPositionSymbol}
        apy={activeYieldPositionAPY}
        maturity={activeYieldPositionMaturity}
      />
    </Select>
  );
};

interface YieldPositionButtonProps {
  apy: number;
  maturity: string;
  symbol: string;
  name: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const YieldPositionButton: FC<YieldPositionButtonProps> = ({
  apy,
  maturity,
  name,
  onClick,
}) => {
  const { isDarkMode } = useDarkMode();
  return (
    <button
      onClick={onClick}
      className={classNames(
        Classes.BUTTON,
        Classes.OUTLINED,
        tw("w-full", "p-4", "justify-between")
      )}
    >
      <div
        className={tw(
          "flex",
          "justify-between",
          "items-center",
          "space-x-4",
          "flex-1"
        )}
      >
        <div className={tw("flex", "items-center", "space-x-4")}>
          <div
            className={classNames(
              tw(
                "flex",
                "flex-col",
                "space-y-2",
                "items-center",
                "justify-center"
              )
            )}
          >
            <span className={tw("text-lg", "text-center")}>{t`${apy}%`}</span>
            <Tag
              minimal
              style={{
                backgroundColor: isDarkMode ? Colors.COBALT3 : Colors.COBALT4,
                color: Colors.WHITE,
              }}
            >
              <div>{"Fixed APY"}</div>
            </Tag>
          </div>
          <LabeledText
            className={tw("text-lg")}
            text={name}
            label={t`Redeemable on ${maturity}`}
          />
        </div>
        <Icon icon={IconNames.CARET_DOWN} />
      </div>
    </button>
  );
};
