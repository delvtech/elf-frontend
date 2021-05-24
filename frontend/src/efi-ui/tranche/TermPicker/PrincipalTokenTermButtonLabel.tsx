import { ReactElement } from "react";

import { Intent, Tag } from "@blueprintjs/core";
import { Tranche } from "elf-contracts/types/Tranche";
import { AssetProxyTokenInfo, PrincipalTokenInfo } from "tokenlists/types";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { useBaseAssetForPool } from "efi-ui/pools/useBaseAssetForPool/useBaseAssetForPool";
import { usePoolForToken } from "efi-ui/pools/usePoolForToken/usePoolForToken";
import { useTokenYield } from "efi-ui/pools/useTokenYield";
import { convertEpochSecondsToDate } from "efi/base/convertEpochSecondsToDate";
import { formatAbbreviatedDate } from "efi/base/dates";
import { formatPercent } from "efi/base/formatPercent";
import { ERC20Shim } from "efi/contracts/ERC20Shim";
import { CryptoAsset } from "efi/crypto/CryptoAsset";
import { getCryptoSymbol } from "efi/crypto/getCryptoSymbol";
import { defaultProvider } from "efi/providers/providers";
import { getTokenInfo } from "efi/tokenlists";

interface PrincipalTokenTermButtonLabelProps {
  tranche: Tranche;
  baseAsset: CryptoAsset;
}

/**
 * A Principal token centric display label for a tranche. This label emphasizes
 * principal token metrics rather than the underlying vault's metrics.
 */
export function PrincipalTokenTermButtonLabel({
  baseAsset,
  tranche,
}: PrincipalTokenTermButtonLabelProps): ReactElement {
  const trancheInfo = getTokenInfo<PrincipalTokenInfo>(tranche.address);
  const {
    extensions: { unlockTimestamp },
  } = trancheInfo;

  const {
    extensions: { position },
  } = getTokenInfo<PrincipalTokenInfo>(tranche.address);
  const { name: positionName } = getTokenInfo<AssetProxyTokenInfo>(position);

  const unlockDate = convertEpochSecondsToDate(unlockTimestamp);

  const pool = usePoolForToken(tranche as ERC20Shim, defaultProvider);
  const baseAssetContract = useBaseAssetForPool(pool);
  const fixedYield = useTokenYield(baseAssetContract, pool, "principal");

  const formattedTrancheAPY = fixedYield ? formatPercent(fixedYield) : "-";

  const formattedDate = unlockDate
    ? formatAbbreviatedDate(unlockDate)
    : t`Loading unlock date...`;

  const baseAssetSymbol = getCryptoSymbol(baseAsset);

  return (
    <div className={tw("flex", "items-center", "h-full", "space-x-4")}>
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
        text={`${baseAssetSymbol} Principal Token`}
        label={t`via ${positionName}`}
      />
    </div>
  );
}
