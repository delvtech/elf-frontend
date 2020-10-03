import { ConnectWalletEmptyState } from "efi/ui/wallets/ConnectWalletEmptyState/ConnectWalletEmptyState";
import React, { FC } from "react";
import tw from "tailwindcss-classnames";

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
      <ConnectWalletEmptyState />
    </div>
  );
};
