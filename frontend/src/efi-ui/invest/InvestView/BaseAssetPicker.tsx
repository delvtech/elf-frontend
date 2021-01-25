import React, { FC, SVGProps } from "react";

import { Classes, H4, Icon } from "@blueprintjs/core";
import { IconName, IconNames } from "@blueprintjs/icons";
import { Select } from "@blueprintjs/select";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import classNames from "classnames";
import { CryptoSymbol } from "efi/crypto/CryptoSymbol";
export interface BaseAsset {
  id: string;
  name: string;
  symbol: CryptoSymbol;
  fiatPrice: string;
  assetIcon: FC<SVGProps<SVGSVGElement> & { title?: string }>;
}
interface BaseAssetPickerProps {
  className?: string;
  baseAssets: BaseAsset[];
  activeBaseAssetId: string;
  onBaseAssetChange: (newBaseAsset: BaseAsset) => void;
}
export const BaseAssetPicker: FC<BaseAssetPickerProps> = ({
  className,
  baseAssets,
  onBaseAssetChange,
  activeBaseAssetId,
}) => {
  const activeBaseAsset = baseAssets.find(({ id }) => id === activeBaseAssetId);

  // This should never happen, and is only here for typesafety
  if (!activeBaseAsset) {
    return <span>{t`Could not find any base assets`}</span>;
  }

  const {
    name: assetName,
    symbol: assetSymbol,
    assetIcon: AssetIcon,
  } = activeBaseAsset;

  return (
    <Select
      className={classNames(tw("w-64", "flex-shrink-0"), className)}
      popoverProps={{ minimal: true, targetClassName: tw("w-full") }}
      items={baseAssets}
      filterable={false}
      itemRenderer={(
        { name, symbol, assetIcon: AssetIcon },
        { handleClick }
      ) => (
        <BaseAssetButton
          fill
          minimal
          onClick={handleClick}
          assetIcon={AssetIcon}
          assetSymbol={symbol}
          assetName={name}
        />
      )}
      onItemSelect={onBaseAssetChange}
    >
      <BaseAssetButton
        minimal
        rightIcon={IconNames.CARET_DOWN}
        assetIcon={AssetIcon}
        assetName={assetName}
        assetSymbol={assetSymbol}
      />
    </Select>
  );
};
interface BaseAssetButtonProps {
  outlined?: boolean;
  fill?: boolean;
  minimal?: boolean;
  assetIcon: React.FC<
    React.SVGProps<SVGSVGElement> & {
      title?: string | undefined;
    }
  >;
  assetName: string;
  assetSymbol: string;
  rightIcon?: IconName;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const BaseAssetButton: FC<BaseAssetButtonProps> = ({
  fill,
  minimal,
  outlined,
  assetIcon: AssetIcon,
  assetName,
  assetSymbol,
  rightIcon,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={classNames(Classes.BUTTON, {
        [Classes.MINIMAL]: minimal,
        [Classes.OUTLINED]: outlined,
        [Classes.FILL]: fill,
      })}
    >
      <AssetLabel
        icon={AssetIcon}
        assetName={assetName}
        assetSymbol={assetSymbol}
      />
      {rightIcon && <Icon icon={rightIcon} className={tw("pr-4")} />}
    </button>
  );
};
interface AssetLabelProps {
  icon: React.FC<
    React.SVGProps<SVGSVGElement> & {
      title?: string | undefined;
    }
  >;
  assetName: string;
  assetSymbol: string;
}

const AssetLabel: FC<AssetLabelProps> = ({
  icon: AssetIcon,
  assetName,
  assetSymbol,
}) => {
  return (
    <div className={tw("p-4", "justify-between")}>
      <div className={tw("flex", "items-center", "space-x-4", "flex-1")}>
        <AssetIcon height={50} width={50} />
        <div className={tw("flex", "flex-col", "space-y-1")}>
          <H4 className={tw("m-0")}>{t`${assetName}`}</H4>
          <span className={Classes.TEXT_LARGE}>{assetSymbol}</span>
        </div>
      </div>
    </div>
  );
};
