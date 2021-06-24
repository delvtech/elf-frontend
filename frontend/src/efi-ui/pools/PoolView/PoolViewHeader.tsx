import { ReactElement } from "react";

import { Colors, Intent, Tag } from "@blueprintjs/core";
import classNames from "classnames";
import { differenceInDays, format } from "date-fns";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { findAssetIcon } from "efi-ui/crypto/CryptoIcon";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { getCryptoAssetForToken } from "efi/crypto/getCryptoAssetForToken";
import { getCryptoSymbol } from "efi/crypto/getCryptoSymbol";
import { getPoolTokens } from "efi/pools/getPoolTokens";
import { getTrancheForPool } from "efi/pools/getTrancheForPool";
import { PoolInfo } from "efi/pools/PoolInfo";
import { getTermAssetSymbol } from "efi/tranche/getTermAssetSymbol";

interface PoolViewHeaderProps {
  poolInfo: PoolInfo;
}
export function PoolViewHeader({
  poolInfo,
}: PoolViewHeaderProps): ReactElement {
  const { isDarkMode } = useDarkMode();
  const { baseAssetInfo, termAssetInfo } = getPoolTokens(poolInfo);
  const baseAsset = getCryptoAssetForToken(baseAssetInfo.address);
  const baseAssetSymbol = getCryptoSymbol(baseAsset);
  const { label: termAssetSymbol } = getTermAssetSymbol(
    termAssetInfo.address,
    baseAssetSymbol
  );
  const BaseAssetIcon = findAssetIcon(baseAsset);

  const trancheInfo = getTrancheForPool(poolInfo);
  const { unlockTimestamp, createdAtTimestamp } = trancheInfo.extensions;

  const startTime = createdAtTimestamp * 1000;
  const maturityTime = unlockTimestamp * 1000;

  const dayDifference = differenceInDays(
    maturityTime as number,
    startTime as number
  );

  const termLength =
    dayDifference > 10
      ? Math.round(
          differenceInDays(maturityTime as number, startTime as number) / 10
        ) * 10
      : dayDifference;

  return (
    <div
      style={{ height: 70 }}
      className={tw("flex", "w-full", "items-center", "mt-8", "lg:mt-0")}
    >
      {BaseAssetIcon ? (
        <div
          className={classNames(
            tw(
              "hidden",
              "md:flex",
              "items-center",
              "rounded",
              "p-2",
              "flex-shrink-0"
            )
          )}
        >
          <div
            style={{
              borderColor: isDarkMode ? Colors.GRAY5 : undefined,
              backgroundColor: isDarkMode ? Colors.WHITE : undefined,
            }}
            className={tw(
              "flex",
              "flex-shrink-0",
              "items-center",
              "p-2",
              "rounded-full",
              "z-10",
              "bg-white",
              "border",
              "shadow-sm"
            )}
          >
            <BaseAssetIcon height={36} width={36} />
          </div>
        </div>
      ) : null}
      <div
        className={tw(
          "flex",
          "flex-col",
          "justify-center",
          "ml-0",
          "md:ml-4",
          "m-0"
        )}
      >
        <div className={classNames("h2")}>
          {baseAssetSymbol ? `${baseAssetSymbol} - ${termAssetSymbol}` : ""}
          {baseAssetSymbol ? (
            <sup className={tw("ml-1")}>
              <Tag minimal intent={Intent.WARNING}>{t`alpha`}</Tag>
            </sup>
          ) : null}
        </div>
        <div>
          {termLength
            ? t`${termLength || 0} Day - ${
                format(maturityTime || 0, "MMM d, y") || 0
              }`
            : ""}
        </div>
      </div>
    </div>
  );
}
