import { ReactElement } from "react";

import tw from "efi-tailwindcss-classnames";

interface PortfolioAssetLabelProps {
  name: string;
}

export function PortfolioAssetLabel({
  name,
}: PortfolioAssetLabelProps): ReactElement {
  return (
    <div
      className={tw(
        "flex",
        "py-6",
        "px-2",
        "w-full",
        "space-x-8",
        "justify-center",
        "items-center"
      )}
    >
      {name}
    </div>
  );
}
