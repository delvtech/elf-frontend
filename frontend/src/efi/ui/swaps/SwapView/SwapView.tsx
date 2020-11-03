import React, { FC } from "react";

import { RouteComponentProps } from "@reach/router";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { SimpleCryptoAssetFilter } from "efi/ui/swaps/SimpleCryptoAssetFilter/SimpleCryptoAssetFilter";
import { useWallet } from "efi/ui/wallets/hooks/useWallet";
import { MissingWalletEmptyState } from "efi/ui/wallets/MissingWalletEmptyState/MissingWalletEmptyState";

interface SwapViewProps extends RouteComponentProps {}
export const SwapView: FC<SwapViewProps> = () => {
  const { account } = useWallet();

  if (!account) {
    return <MissingWalletEmptyState />;
  }

  return (
    <div
      className={tw(
        "flex",
        "flex-col",
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
      </div>
    </div>
  );
};
