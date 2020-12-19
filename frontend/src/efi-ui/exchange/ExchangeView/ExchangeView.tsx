import React, { FC } from "react";

import { RouteComponentProps } from "@reach/router";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { SimpleCryptoAssetFilter } from "efi-ui/exchange/SimpleCryptoAssetFilter/SimpleCryptoAssetFilter";
import { ConnectWalletState } from "efi-ui/wallets/ConnectWalletState/ConnectWalletState";
import { useWallet } from "efi-ui/wallets/hooks/useWallet";

interface ExchangeViewProps extends RouteComponentProps {}
export const ExchangeView: FC<ExchangeViewProps> = () => {
  const { accountAddress: account } = useWallet();

  if (!account) {
    return <ConnectWalletState />;
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
