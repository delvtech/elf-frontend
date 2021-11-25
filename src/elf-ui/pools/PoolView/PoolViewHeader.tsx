import { ReactElement } from "react";

import { Link } from "@reach/router";
import classNames from "classnames";
import { format } from "date-fns";
import { PrincipalTokenInfo, YieldTokenInfo } from "tokenlists/types";
import { t } from "ttag";

import tw from "elf-tailwindcss-classnames";
import {
  useIsTailwindLargeScreen,
  useIsTailwindSmallScreen,
} from "elf-ui/base/mediaBreakpoints";
import { findAssetIcon } from "elf-ui/crypto/CryptoIcon";
import { getCryptoAssetForToken } from "elf/crypto/getCryptoAssetForToken";
import { getCryptoSymbol } from "elf/crypto/getCryptoSymbol";
import { getOppositePoolInfo } from "elf/pools/getOppositePoolInfo";
import { getPoolTokens } from "elf/pools/getPoolTokens";
import { getPrincipalTokenInfoForPool } from "elf/pools/getPrincipalTokenInfoForPool";
import { PoolInfo } from "elf/pools/PoolInfo";
import { isYieldPool } from "elf/pools/weightedPool";
import { formatLengthOfTime } from "elf/time/formatLengthOfTime/formatLengthOfTime";
import { formatTermAssetShortSymbol } from "elf/tranche/format";

interface PoolViewHeaderProps {
  poolInfo: PoolInfo;
}
export function PoolViewHeader({
  poolInfo,
}: PoolViewHeaderProps): ReactElement {
  const isSmallScreen = useIsTailwindSmallScreen();
  const isLargeScreen = useIsTailwindLargeScreen();
  const { baseAssetInfo, termAssetInfo } = getPoolTokens(poolInfo);
  const baseAsset = getCryptoAssetForToken(baseAssetInfo.address);
  const baseAssetSymbol = getCryptoSymbol(baseAsset);
  const termAssetShortSymbol = formatTermAssetShortSymbol(
    termAssetInfo as PrincipalTokenInfo | YieldTokenInfo
  );
  const BaseAssetIcon = findAssetIcon(baseAsset);

  const trancheInfo = getPrincipalTokenInfoForPool(poolInfo);
  const {
    extensions: { unlockTimestamp, createdAtTimestamp },
  } = trancheInfo;

  const startTime = createdAtTimestamp * 1000;
  const maturityTime = unlockTimestamp * 1000;

  const termLength = formatLengthOfTime(startTime, maturityTime);

  const oppositePoolInfo = getOppositePoolInfo(poolInfo);
  const oppositePoolType = isYieldPool(oppositePoolInfo)
    ? t`Yield`
    : t`Principal`;

  return (
    <div
      style={{ height: 70 }}
      className={tw("flex", "w-full", "items-center", "mt-8", "lg:mt-0")}
    >
      <div className={tw("rounded-full", "z-10", "shadow-sm")}>
        <BaseAssetIcon height={48} width={48} />
      </div>
      <div
        className={tw(
          "flex",
          "flex-col",
          "justify-center",
          "ml-2",
          "md:ml-4",
          "m-0"
        )}
      >
        <div className={classNames(isSmallScreen ? "h4" : "h2")}>
          {baseAssetSymbol
            ? `${baseAssetSymbol} - ${termAssetShortSymbol}`
            : ""}
        </div>
        <div className={tw("flex", "space-x-8")}>
          <span>
            {t`${termLength} - ${format(maturityTime || 0, "MMM d, y") || 0}`}
          </span>
          {isLargeScreen && (
            <Link
              to={`/pools/${oppositePoolInfo.address}`}
              className={tw("text-center")}
            >{t`Go to ${oppositePoolType} Pool`}</Link>
          )}
        </div>
      </div>
    </div>
  );
}
