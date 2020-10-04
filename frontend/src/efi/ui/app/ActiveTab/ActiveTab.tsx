import React, { FC } from "react";
import { Navigation } from "efi/app/navigation";
import { SwapView } from "efi/ui/swaps/SwapView/SwapView";

interface ActiveTabProps {
  activeTab: Navigation;
}
export const ActiveTab: FC<ActiveTabProps> = ({ activeTab }) => {
  switch (activeTab) {
    case Navigation.SWAP:
      return <SwapView />;
    default:
      return null;
  }
};
