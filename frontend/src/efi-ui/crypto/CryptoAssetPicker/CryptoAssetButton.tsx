import React, { ReactElement } from "react";

import { Classes, Icon } from "@blueprintjs/core";
import { IconName } from "@blueprintjs/icons";
import classNames from "classnames";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { findAssetIcon2 } from "efi-ui/crypto/CryptoIcon";
import { getCryptoName } from "efi/crypto/getCryptoName/getCryptoName";
import { getCryptoSymbol } from "efi-ui/crypto/hooks/useCryptoSymbol/getCryptoSymbol";
import { TokenIcon } from "efi-ui/token/TokenIcon";
import { CryptoAsset } from "efi/crypto/CryptoAsset";

interface CryptoAssetButtonProps {
  outlined?: boolean;
  fill?: boolean;
  minimal?: boolean;
  cryptoAsset: CryptoAsset | undefined;

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
  const assetIcon = findAssetIcon2(cryptoAsset);

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
  icon: TokenIcon | undefined;
  assetName: string | undefined;
  assetSymbol: string;
}
function AssetLabel({
  icon: AssetIcon,
  assetName,
  assetSymbol,
}: AssetLabelProps): ReactElement {
  return (
    <div className={tw("p-4", "justify-between")}>
      <div className={tw("flex", "items-center", "space-x-4", "flex-1")}>
        <LabeledText
          icon={AssetIcon && <AssetIcon height={50} width={50} />}
          iconClassName={tw("mr-4")}
          large
          text={
            <span className={tw("text-lg", "text-center")}>
              {t`${assetName}`}
            </span>
          }
          label={<span className={tw("text-sm")}>{assetSymbol}</span>}
        />
      </div>
    </div>
  );
}
