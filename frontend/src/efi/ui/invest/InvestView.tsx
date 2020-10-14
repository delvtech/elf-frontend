import { RouteComponentProps } from "@reach/router";
import { useWallet } from "efi/ui/wallets/hooks/useWallet";
import { MissingWalletEmptyState } from "efi/ui/wallets/MissingWalletEmptyState/MissingWalletEmptyState";
import React, { FC } from "react";
import tw from "tailwindcss-classnames";

interface InvestViewProps extends RouteComponentProps {}
export const InvestView: FC<InvestViewProps> = () => {
  const { account } = useWallet();

  if (!!account) {
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
    ></div>
  );
};
