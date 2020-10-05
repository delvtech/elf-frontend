import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import classNames from "classnames";
import { CryptoAssetSuggest } from "efi/ui/base/CryptoAssetSuggest/CryptoAssetSuggest";
import React, { FC } from "react";
import tw from "tailwindcss-classnames";
import { t } from "ttag";

interface SimpleCryptoAssetFilterProps {
  className?: string;
}
export const SimpleCryptoAssetFilter: FC<SimpleCryptoAssetFilterProps> = ({
  className,
}) => {
  return (
    <div
      className={classNames(
        tw(
          "flex",
          "flex-col",
          "w-full",
          "justify-center",
          "items-center",
          "gap-6"
        ),
        className
      )}
    >
      <span
        className={tw(
          "text-lg",
          "w-full",
          "inline-flex",
          "items-center",
          "space-x-4",
          "justify-center"
        )}
      >
        <CryptoAssetSuggest
          placeholder={t`Base asset`}
          onCryptoAssetSelect={() => {}}
        />
        <Icon icon={IconNames.ARROW_RIGHT} />
        <CryptoAssetSuggest
          placeholder={t`Desired asset`}
          onCryptoAssetSelect={() => {}}
        />
      </span>
    </div>
  );
};
