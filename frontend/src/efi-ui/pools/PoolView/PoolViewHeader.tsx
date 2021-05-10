import { ReactElement } from "react";

import { Colors, Intent, Tag } from "@blueprintjs/core";
import classNames from "classnames";
import { format } from "date-fns";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { findAssetIcon } from "efi-ui/crypto/CryptoIcon";
import { useCryptoAssetForToken } from "efi-ui/crypto/hooks/useCryptoAssetForToken";
import { useCryptoSymbol } from "efi-ui/crypto/hooks/useCryptoSymbol/useCryptoSymbol";
import { usePoolTokens } from "efi-ui/pools/usePoolTokens/usePoolTokens";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { useTermAssetSymbol } from "efi-ui/tranche/useTermAssetSymbol";
import { parseSortedTokensForPool } from "efi/pools/parseSortedTokensForPool";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { differenceInDays } from "date-fns";
import { useTrancheForPool } from "efi-ui/pools/useTrancheForPool/useTrancheForPool";
import { useTrancheCreatedAt } from "efi-ui/tranche/useTrancheCreatedAt";
import { PoolContract } from "efi/pools/PoolContract";

interface PoolViewHeaderProps {
  pool: PoolContract | undefined;
}
export function PoolViewHeader({ pool }: PoolViewHeaderProps): ReactElement {
  const { isDarkMode } = useDarkMode();
  const { data: [tokens] = [] } = usePoolTokens(pool);
  const { baseAssetContract, termAssetContract } =
    parseSortedTokensForPool(tokens);
  const baseAsset = useCryptoAssetForToken(baseAssetContract?.address);
  const baseAssetSymbol = useCryptoSymbol(baseAsset);
  const { label: termAssetSymbol } = useTermAssetSymbol(
    termAssetContract?.address,
    baseAssetSymbol
  );
  const BaseAssetIcon = findAssetIcon(baseAssetSymbol);

  const tranche = useTrancheForPool(pool);
  const { data: unlockBN } = useSmartContractReadCall(
    tranche,
    "unlockTimestamp"
  );

  const unlockTime = unlockBN?.toNumber();
  const trancheCreatedAt = useTrancheCreatedAt(tranche);
  const startTime = trancheCreatedAt ? trancheCreatedAt * 1000 : undefined;
  const maturityTime = unlockTime ? unlockTime * 1000 : undefined;

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
      className={tw("flex", "items-center", "mt-8", "lg:mt-0")}
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
          <div
            style={{ marginLeft: -8 }}
            className={tw(
              "flex",
              "flex-shrink-0",
              "items-center",
              "p-2",
              "rounded-full",
              "bg-white",
              "border"
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
