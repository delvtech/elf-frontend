import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import classNames from "classnames";
import React, { FC, useCallback, useState } from "react";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { CryptoAssetSuggest } from "efi-ui/crypto/CryptoAssetSuggest/CryptoAssetSuggest";
import { CryptoAssetInfo } from "efi/crypto/CryptoAssetInfo";

interface SimpleCryptoAssetFilterProps {
  className?: string;
}
export const SimpleCryptoAssetFilter: FC<SimpleCryptoAssetFilterProps> = ({
  className,
}) => {
  const [baseAsset, setBaseAsset] = useState<CryptoAssetInfo | undefined>();
  const onRemoveBaseAsset = useCallback(() => setBaseAsset(undefined), []);

  const [desiredAsset, setDesiredAsset] = useState<
    CryptoAssetInfo | undefined
  >();
  const onRemoveDesiredAsset = useCallback(
    () => setDesiredAsset(undefined),
    []
  );

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
          omnibarPlaceholder={t`Choose a base asset...`}
          activeCryptoAsset={baseAsset}
          onSelect={setBaseAsset}
          onRemove={onRemoveBaseAsset}
        />
        <Icon icon={IconNames.ARROW_RIGHT} />
        <CryptoAssetSuggest
          placeholder={t`Desired asset`}
          omnibarPlaceholder={t`Choose a desired asset...`}
          activeCryptoAsset={desiredAsset}
          onSelect={setDesiredAsset}
          onRemove={onRemoveDesiredAsset}
        />
      </span>
    </div>
  );
};
