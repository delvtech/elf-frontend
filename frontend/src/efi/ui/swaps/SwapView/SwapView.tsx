import { CryptoAssetTable } from "efi/ui/base/CryptoAssetTable/CryptoAssetTable";
import { SimpleCryptoAssetFilter } from "efi/ui/swaps/SimpleCryptoAssetFilter/SimpleCryptoAssetFilter";
import React, { FC } from "react";
import tw from "tailwindcss-classnames";
import { t } from "ttag";

interface SwapViewProps {}
export const SwapView: FC<SwapViewProps> = () => {
  return (
    <div
      className={tw(
        "flex",
        "h-full",
        "w-full",
        "md:justify-center",
        "md:items-center"
      )}
    >
      <div
        className={tw(
          "flex",
          "flex-col",
          "flex-1",
          "items-center",
          "justify-center",
          "gap-4",
          "px-4",
          "py-6"
        )}
      >
        <span className={tw("text-lg", "font-bold", "lg:text-2xl")}>
          {t`Pick two assets to swap`}
        </span>
        <SimpleCryptoAssetFilter className={tw("py-4")} />
        <span className={tw("text-lg", "font-bold", "lg:text-2xl")}>
          {t`or choose a pair below`}
        </span>

        <CryptoAssetTable />
      </div>
    </div>
  );
};
