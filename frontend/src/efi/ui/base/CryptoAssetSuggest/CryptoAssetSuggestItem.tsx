import React, { useMemo } from "react";
import { Classes, H4 as span, Spinner } from "@blueprintjs/core";
import classNames from "classnames";
import { FC } from "react";
import tw from "tailwindcss-classnames";
import { t } from "ttag";
import { CryptoAssetInfo } from "efi/crypto/CryptoAssetInfo";
import { CryptoName } from "efi/crypto/CryptoName";

export const itemHeaderClassName = classNames(
  Classes.TEXT_SMALL,
  tw("font-bold")
);
export const CryptoAssetSuggestItem: FC<{
  cryptoAsset: CryptoAssetInfo;
}> = ({ cryptoAsset: { symbol, name, id } }) => {
  // TODO: Use real data not stubs
  const sections = useMemo(
    () => [
      {
        header: t`Wallet balance`,
        value: id === CryptoName.YFI ? 0 : Math.random() * 10,
        valueLabel: (val: number) => `${val.toFixed(5)} ${symbol}`,
      },
      {
        header: t`Total value`,
        value: id === CryptoName.YFI ? 0 : Math.random() * 100,
        valueLabel: (val: number) => `$${val.toFixed(2)}`,
      },
      {
        header: t`Market price`,
        value: Math.random() * 100,
        valueLabel: (val: number) => `1 ${symbol} = $${val.toFixed(2)}`,
        priceLoading: id === CryptoName.YFI,
      },
    ],
    [id, symbol]
  );

  return (
    <div
      className={tw(
        "grid",
        "gap-6",
        "px-6",
        "w-full",
        "items-center",
        "md:grid-cols-4",
        "md:gap-12"
      )}
    >
      <span className={classNames(tw("text-base", "font-bold"))}>{name}</span>

      {sections.map(({ header, value, valueLabel, priceLoading }) => {
        return (
          <div>
            <div className={itemHeaderClassName}>{header}</div>
            {priceLoading ? (
              <Spinner
                size={Spinner.SIZE_SMALL}
                className={tw("justify-start", "pt-1")}
              />
            ) : (
              <div
                className={classNames(tw("text-base"), {
                  [Classes.TEXT_MUTED]: value <= 0,
                })}
              >
                {valueLabel(value)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
