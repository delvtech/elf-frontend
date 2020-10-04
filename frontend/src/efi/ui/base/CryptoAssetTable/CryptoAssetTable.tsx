import React, { FC } from "react";
import tw from "tailwindcss-classnames";

interface CryptoAssetTableProps {}
export const CryptoAssetTable: FC<CryptoAssetTableProps> = () => {
  return (
    <div className={tw("flex", "md:justify-center", "md:items-center")}>
      crypto table here
    </div>
  );
};
