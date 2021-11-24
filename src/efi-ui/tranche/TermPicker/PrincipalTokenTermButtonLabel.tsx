import { Fragment, ReactElement } from "react";

import { Intent, Tag } from "@blueprintjs/core";
import { Tranche } from "elf-contracts-typechain/dist/types/Tranche";
import { AssetProxyTokenInfo, PrincipalTokenInfo } from "tokenlists/types";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { useTokenYield } from "efi-ui/pools/hooks/useTokenYield";
import { convertEpochSecondsToDate } from "efi/base/convertEpochSecondsToDate";
import { formatAbbreviatedDate } from "efi/base/dates";
import { formatPercent } from "efi/base/formatPercent";
import { CryptoAsset } from "efi/crypto/CryptoAsset";
import { getCryptoSymbol } from "efi/crypto/getCryptoSymbol";
import { getPoolInfoForPrincipalToken } from "efi/pools/ccpool";
import { getTokenInfo } from "efi/tokenlists";
import classNames from "classnames";
import { ONE_DAY_IN_MILLISECONDS } from "efi/base/time";
import { useTotalFiatLiquidity } from "efi-ui/pools/hooks/useTotalFiatLiquidityForPool/useTotalFiatLiquidityForPool";
import { Currencies, Money } from "ts-money";
import { useNowMs } from "efi-ui/base/hooks/useNowMs/useNowMs";
import { useIsTailwindLargeScreen } from "efi-ui/base/mediaBreakpoints";

interface PrincipalTokenTermButtonLabelProps {
  tranche: Tranche;
  baseAsset: CryptoAsset;
  className?: string;
}

/**
 * A Principal token centric display label for a tranche. This label emphasizes
 * principal token metrics rather than the underlying vault's metrics.
 */
export function PrincipalTokenTermButtonLabel({
  baseAsset,
  tranche,
  className,
}: PrincipalTokenTermButtonLabelProps): ReactElement {
  const isLargeScreen = useIsTailwindLargeScreen();
  const nowMs = useNowMs();
  const trancheInfo = getTokenInfo<PrincipalTokenInfo>(tranche.address);
  const poolInfo = getPoolInfoForPrincipalToken(trancheInfo.address);

  const {
    extensions: { unlockTimestamp },
  } = trancheInfo;

  const {
    extensions: { position },
  } = getTokenInfo<PrincipalTokenInfo>(tranche.address);
  const { name: positionName } = getTokenInfo<AssetProxyTokenInfo>(position);

  const unlockDate = convertEpochSecondsToDate(unlockTimestamp);
  const fixedYield = useTokenYield(poolInfo, "principal");

  const formattedTrancheAPY = fixedYield ? formatPercent(fixedYield) : "-";

  const formattedDate = unlockDate
    ? formatAbbreviatedDate(unlockDate)
    : t`Loading unlock date...`;

  const baseAssetSymbol = getCryptoSymbol(baseAsset);

  const isPool24HoursOld =
    nowMs - poolInfo.extensions.createdAtTimestamp * 1000 >
    ONE_DAY_IN_MILLISECONDS;

  const fiatLiquidity = useTotalFiatLiquidity(poolInfo);
  const has200kLiquidity = !!fiatLiquidity?.greaterThan(
    Money.fromDecimal(200000, Currencies.USD)
  );
  let apyLabel = t`✨ NEW ✨`;
  if (isPool24HoursOld || (!isPool24HoursOld && has200kLiquidity)) {
    apyLabel = t`${formattedTrancheAPY} APR`;
  }

  return (
    <div
      className={classNames(
        tw("flex", "h-full", "space-x-4", "w-full"),
        className
      )}
    >
      <LabeledText
        large={isLargeScreen}
        icon={
          isLargeScreen ? (
            <div
              className={tw(
                "flex",
                "flex-col",
                "items-center",
                "justify-center",
                "mr-4"
              )}
            >
              <span className={tw("text-lg", "text-center")}>{apyLabel}</span>
              <Tag
                large
                intent={Intent.PRIMARY}
                fill
                className={tw("text-center")}
              >
                {formattedDate}
              </Tag>
            </div>
          ) : null
        }
        className={tw("w-full", "text-left")}
        text={
          isLargeScreen ? (
            `${baseAssetSymbol} Principal Token`
          ) : (
            <Fragment>
              <div className={tw("flex", "w-full", "mb-2")}>
                <span className={tw("flex-1")}>{apyLabel}</span>
                <Tag intent={Intent.PRIMARY} className={tw("text-center")}>
                  {formattedDate}
                </Tag>
              </div>
              <span>{`${baseAssetSymbol} Principal Token`}</span>
            </Fragment>
          )
        }
        label={t`via ${positionName}`}
      />
    </div>
  );
}
