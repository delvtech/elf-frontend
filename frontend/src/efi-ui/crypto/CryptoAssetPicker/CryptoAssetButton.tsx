import React, { ReactElement } from "react";

import { Classes, Icon } from "@blueprintjs/core";
import { IconName } from "@blueprintjs/icons";
import classNames from "classnames";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { findAssetIcon } from "efi-ui/crypto/CryptoIcon";
import { IconProps } from "efi-ui/token/TokenIcon";
import { CryptoAsset } from "efi/crypto/CryptoAsset";
import { getCryptoName } from "efi/crypto/getCryptoName/getCryptoName";
import { getCryptoSymbol } from "efi/crypto/getCryptoSymbol";
import { useIsTailwindLargeScreen } from "efi-ui/base/mediaBreakpoints";

interface CryptoAssetButtonProps {
  outlined?: boolean;
  fill?: boolean;
  minimal?: boolean;
  cryptoAsset: CryptoAsset;

  rightIcon?: IconName;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export function CryptoAssetButton({
  fill,
  minimal,
  outlined,
  cryptoAsset,
  rightIcon,
  onClick,
}: CryptoAssetButtonProps): ReactElement {
  const assetName = getCryptoName(cryptoAsset);
  const assetSymbol = getCryptoSymbol(cryptoAsset);
  const assetIcon = findAssetIcon(cryptoAsset);

  if (!cryptoAsset || !assetSymbol) {
    return <div className={classNames(Classes.SKELETON)} />;
  }

  return (
    <button
      onClick={onClick}
      className={classNames(
        Classes.BUTTON,
        {
          [Classes.MINIMAL]: minimal,
          [Classes.OUTLINED]: outlined,
          [Classes.FILL]: fill,
        },
        tw("flex", "justify-start")
      )}
    >
      <AssetLabel
        icon={assetIcon}
        assetName={assetName}
        assetSymbol={assetSymbol}
      />
      {rightIcon && <Icon icon={rightIcon} className={tw("pr-4")} />}
    </button>
  );
}
interface AssetLabelProps {
  icon: React.FC<IconProps>;
  assetName: string;
  assetSymbol: string;
}
function AssetLabel({
  icon: AssetIcon,
  assetName,
  assetSymbol,
}: AssetLabelProps): ReactElement {
  const isLargeScreen = useIsTailwindLargeScreen();
  const height = isLargeScreen ? 50 : 30;
  const width = height;
  return (
    <div className={tw("p-4", "justify-between", "flex-1")}>
      <div className={tw("flex", "items-center", "space-x-4", "flex-1")}>
        <LabeledText
          icon={AssetIcon && <AssetIcon height={height} width={width} />}
          iconClassName={tw("mr-4")}
          large={isLargeScreen}
          label={
            <span
              className={tw("text-xs", "lg:text-sm", "flex-wrap")}
            >{t`${assetName}`}</span>
          }
          text={
            <span className={tw("lg:text-lg", "text-center")}>
              {assetSymbol}
            </span>
          }
        />
      </div>
    </div>
  );
}
