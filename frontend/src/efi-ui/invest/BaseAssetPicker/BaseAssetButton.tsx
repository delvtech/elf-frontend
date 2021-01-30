import React, { FC } from "react";

import { Classes, H4, Icon } from "@blueprintjs/core";
import { IconName } from "@blueprintjs/icons";
import classNames from "classnames";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { CryptoAssetWithIcon } from "efi-ui/crypto/CryptoAssetWithIcon";
import { useCryptoName } from "efi-ui/crypto/hooks/useCryptoName/useCryptoName";
import { useCryptoSymbol } from "efi-ui/crypto/hooks/useCryptoSymbol/useCryptoSymbol";

interface BaseAssetButtonProps {
  outlined?: boolean;
  fill?: boolean;
  minimal?: boolean;
  baseAsset: CryptoAssetWithIcon;
  rightIcon?: IconName;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export const BaseAssetButton: FC<BaseAssetButtonProps> = ({
  fill,
  minimal,
  outlined,
  baseAsset,
  baseAsset: { assetIcon: AssetIcon },
  rightIcon,
  onClick,
}) => {
  const assetName = useCryptoName(baseAsset);
  const assetSymbol = useCryptoSymbol(baseAsset);

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
