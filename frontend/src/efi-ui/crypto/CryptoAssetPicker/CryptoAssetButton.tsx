import React, { ReactElement } from "react";

import { Classes, Icon } from "@blueprintjs/core";
import { IconName } from "@blueprintjs/icons";
import classNames from "classnames";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { findAssetIcon } from "efi-ui/crypto/CryptoIcon";
import { useCryptoName } from "efi-ui/crypto/hooks/useCryptoName/useCryptoName";
import { useCryptoSymbol } from "efi-ui/crypto/hooks/useCryptoSymbol/useCryptoSymbol";
import { TokenIcon } from "efi-ui/token/TokenIcon";
import { CryptoAsset } from "efi/crypto/CryptoAsset";

interface CryptoAssetButtonProps {
  outlined?: boolean;
  fill?: boolean;
  minimal?: boolean;
  cryptoAsset: CryptoAsset | undefined;
  loading?: boolean;
  rightIcon?: IconName;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export function CryptoAssetButton({
  fill,
  minimal,
  outlined,
  cryptoAsset,
  rightIcon,
  loading,
  onClick,
}: CryptoAssetButtonProps): ReactElement {
  const assetName = useCryptoName(cryptoAsset);
  const assetSymbol = useCryptoSymbol(cryptoAsset);
  const assetIcon = findAssetIcon(assetSymbol);

  return (
    <button
      onClick={onClick}
      className={classNames(
        Classes.BUTTON,
        {
          [Classes.MINIMAL]: minimal,
          [Classes.OUTLINED]: outlined,
          [Classes.FILL]: fill,
          [Classes.SKELETON]: loading,
        },
        tw("flex", "justify-start")
      )}
    >
      <AssetLabel
        icon={assetIcon}
        assetName={assetName}
        assetSymbol={assetSymbol || ""}
      />
      {rightIcon && <Icon icon={rightIcon} className={tw("pr-4")} />}
    </button>
  );
}
interface AssetLabelProps {
  icon: TokenIcon | undefined;
  assetName: string;
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
