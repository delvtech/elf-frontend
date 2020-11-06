import React, { FC } from "react";
import { useQuery } from "react-query";
import { Markup } from "react-render-markup";
import { useWindowSize } from "react-use";

import { Button, Drawer, H4, H6 } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import classNames from "classnames";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { SMALL_BREAKPOINT } from "efi/ui/base/mediaBreakpoints";
import { SkeletonText } from "efi/ui/base/SkeletonText/SkeletonText";
import { useCryptoDrawer } from "efi/ui/crypto/useCryptoDrawer/useCryptoDrawer";
import { useDarkMode } from "efi/ui/prefs/useDarkMode/useDarkMode";

interface CryptoDrawerProps {}

export const CryptoDrawer: FC<CryptoDrawerProps> = () => {
  const { darkModeClassName } = useDarkMode();
  const { cryptoDrawerIsOpen, closeCryptoDrawer } = useCryptoDrawer();
  const { width: screenWidth } = useWindowSize();

  // blueprint has some pretty high css specificity for the width.
  const width = screenWidth < SMALL_BREAKPOINT ? "100%" : SMALL_BREAKPOINT;

  // TODO: get this from the useCryptoDrawer
  const cryptoId = "ethereum";

  const { data, status } = useQuery(["crypto", "description"], async () => {
    // TODO: use swagger.json from coingecko
    const result = await fetch(
      `https://api.coingecko.com/api/v3/coins/${cryptoId}?tickers=true&market_data=true`
    );
    return result.json();
  });
  const ethData = data as any;

  const title = ethData?.name;
  const price = ethData?.market_data?.current_price?.usd;
  const totalSupply = ethData?.market_data?.total_supply;
  const circulatingSupply =
    ethData?.market_data?.circulating_supply || ("" as string);
  const description = ethData?.description?.en;
  return (
    <Drawer
      lazy
      style={{ width }}
      onClose={closeCryptoDrawer}
      portalClassName={tw("pointer-events-none")}
      canOutsideClickClose={false}
      enforceFocus={false}
      hasBackdrop={false}
      className={darkModeClassName}
      isOpen={cryptoDrawerIsOpen}
    >
      {status === "loading" ? (
        <SkeletonText />
      ) : (
        <div
          className={tw("flex", "flex-col", "h-full", "pointer-events-auto")}
        >
          <div
            className={classNames(
              "bp3-drawer-header",
              tw("flex-shrink-0", "justify-between")
            )}
          >
            <H4>{title}</H4>
            <Button
              onClick={closeCryptoDrawer}
              minimal
              icon={IconNames.CROSS}
            />
          </div>
          <div className={tw("overflow-y-scroll", "text-justify")}>
            <div className={tw("p-6")}>
              <H4>{t`Price`}</H4>
              <div>{`$${price}`}</div>
            </div>
            <div className={tw("p-6", "space-x-2")}>
              <H4>{t`Supply`}</H4>
              <H6>{t`total: ${totalSupply || "(no total)"}`}</H6>
              <H6>{t`circulating: ${circulatingSupply.toLocalizedString()}`}</H6>
            </div>
            <div className={tw("whitespace-pre-wrap", "p-6")}>
              <H4>{t`Description`}</H4>
              <Markup markup={description} />
            </div>
          </div>
        </div>
      )}
    </Drawer>
  );
};
