import { RouteComponentProps } from "@reach/router";
import { CryptoAssetTable } from "efi/ui/base/CryptoAssetTable/CryptoAssetTable";
import { SimpleCryptoAssetFilter } from "efi/ui/swaps/SimpleCryptoAssetFilter/SimpleCryptoAssetFilter";
import { useWallet } from "efi/ui/wallets/hooks/useWallet";
import { MissingWalletEmptyState } from "efi/ui/wallets/MissingWalletEmptyState/MissingWalletEmptyState";
import WalletSummary from "efi/ui/wallets/WalletSummary";
import React, { FC } from "react";
import tw from "tailwindcss-classnames";
import { t } from "ttag";

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
      <WalletSummary />
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
