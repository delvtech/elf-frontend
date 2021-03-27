import React, { FC } from "react";

import { Classes, Icon } from "@blueprintjs/core";
import { IconName } from "@blueprintjs/icons";
import classNames from "classnames";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { CryptoAssetWithIcon } from "efi-ui/crypto/CryptoAssetWithIcon";
import { useCryptoName } from "efi-ui/crypto/hooks/useCryptoName/useCryptoName";
import { useCryptoSymbol } from "efi-ui/crypto/hooks/useCryptoSymbol/useCryptoSymbol";

interface CryptoAssetButtonProps {
  outlined?: boolean;
  fill?: boolean;
  minimal?: boolean;
  cryptoAsset: CryptoAssetWithIcon;
  rightIcon?: IconName;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export const CryptoAssetButton: FC<CryptoAssetButtonProps> = ({
  fill,
  minimal,
  outlined,
  cryptoAsset,
  cryptoAsset: { assetIcon: AssetIcon },
  rightIcon,
  onClick,
}) => {
  const assetName = useCryptoName(cryptoAsset);
  const assetSymbol = useCryptoSymbol(cryptoAsset);

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
        <LabeledText
          icon={<AssetIcon height={50} width={50} />}
          iconClassName={tw("mr-4")}
          large
          text={
            <span className={classNames("h4", tw("text-center"))}>
              {t`${assetName}`}
            </span>
          }
          label={<span className={tw("text-sm")}>{assetSymbol}</span>}
        />
      </div>
    </div>
  );
};
