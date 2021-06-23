import { ReactElement } from "react";

import { Intent, Tag } from "@blueprintjs/core";
import { Tranche } from "elf-contracts/types/Tranche";
import { AssetProxyTokenInfo, PrincipalTokenInfo } from "tokenlists/types";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { useTokenYield } from "efi-ui/pools/useTokenYield";
import { convertEpochSecondsToDate2 } from "efi/base/convertEpochSecondsToDate";
import { formatAbbreviatedDate } from "efi/base/dates";
import { formatPercent } from "efi/base/formatPercent";
import { CryptoAsset } from "efi/crypto/CryptoAsset";
import { getCryptoSymbol } from "efi/crypto/getCryptoSymbol";
import { getPoolInfoForPrincipalToken } from "efi/pools/ccpool";
import { getTokenInfo } from "efi/tokenlists";
import classNames from "classnames";

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
  const trancheInfo = getTokenInfo<PrincipalTokenInfo>(tranche.address);
  const poolInfo = getPoolInfoForPrincipalToken(trancheInfo.address);

  const {
    extensions: { unlockTimestamp },
  } = trancheInfo;

  const {
    extensions: { position },
  } = getTokenInfo<PrincipalTokenInfo>(tranche.address);
  const { name: positionName } = getTokenInfo<AssetProxyTokenInfo>(position);

  const unlockDate = convertEpochSecondsToDate2(unlockTimestamp);
  const fixedYield = useTokenYield(poolInfo, "principal");

  const formattedTrancheAPY = fixedYield ? formatPercent(fixedYield) : "-";

  const formattedDate = unlockDate
    ? formatAbbreviatedDate(unlockDate)
    : t`Loading unlock date...`;

  const baseAssetSymbol = getCryptoSymbol(baseAsset);

  return (
    <div className={classNames(tw("flex", "h-full", "space-x-4"), className)}>
      <LabeledText
        large
        icon={
          <div
            className={tw(
              "flex",
              "flex-col",
              "items-center",
              "justify-center",
              "mr-4"
            )}
          >
            <span className={tw("text-lg", "text-center")}>
              {t`${formattedTrancheAPY} APY`}
            </span>
            <Tag
              large
              intent={Intent.PRIMARY}
              fill
              className={tw("text-center")}
            >
              {formattedDate}
            </Tag>
          </div>
        }
        className={tw("text-left")}
        text={`${baseAssetSymbol} Principal Token`}
        label={t`via ${positionName}`}
      />
    </div>
  );
}
