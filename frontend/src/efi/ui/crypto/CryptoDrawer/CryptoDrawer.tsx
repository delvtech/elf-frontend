import React, { FC, useState } from "react";
import { useQuery } from "react-query";
import { Markup } from "react-render-markup";

import { Drawer } from "@blueprintjs/core";

import tw from "efi-tailwindcss-classnames";
import { SkeletonText } from "efi/ui/base/SkeletonText/SkeletonText";

interface CryptoDrawerProps {}

export const CryptoDrawer: FC<CryptoDrawerProps> = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  setTimeout(() => {
    setIsOpen(true);
  }, 5000);

  const cryptoId = "ethereum";

  const { data, status } = useQuery(["crypto", "description"], async () => {
    // TODO: use swagger.json from coingecko
    const result = await fetch(
      `https://api.coingecko.com/api/v3/coins/${cryptoId}?tickers=true&market_data=true`
    );
    return result.json();
  });
  const ethData = data as any;

  const description = ethData?.description?.en;
  const drawerIsOpen = (isOpen && status === "success") || status === "loading";
  return (
    <Drawer
      lazy
      hasBackdrop={false}
      className={tw("w-full", "md:w-1/2", "lg:w-1/3", "flex", "p-2")}
      isOpen={drawerIsOpen}
    >
      {status === "loading" ? (
        <SkeletonText />
      ) : (
        <div className={tw("whitespace-pre-wrap")}>
          <Markup markup={description} />
        </div>
      )}
    </Drawer>
  );
};
