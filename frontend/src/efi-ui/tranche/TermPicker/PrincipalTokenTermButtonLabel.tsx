import { ReactElement } from "react";

import { Intent, Tag } from "@blueprintjs/core";
import classNames from "classnames";
import { Tranche } from "elf-contracts/types/Tranche";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { getQueryData } from "efi-ui/base/queryResults";
import { ERC20Shim } from "efi-ui/contracts/ERC20Shim";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { useCryptoSymbol } from "efi-ui/crypto/hooks/useCryptoSymbol/useCryptoSymbol";
import { usePoolForToken } from "efi-ui/pools/usePoolForToken/usePoolForToken";
import { usePoolSpotPrice } from "efi-ui/pools/usePoolSpotPrice/usePoolSpotPrice";
import { useUnderlyingVaultForTranche } from "efi-ui/tranche/useUnderlyingVaultForTranche";
import { convertEpochSecondsToDate } from "efi/base/convertEpochSecondsToDate";
import { formatAbbreviatedDate } from "efi/base/dates";
import { CryptoAsset } from "efi/crypto/CryptoAsset";
import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";
import { calculateTrancheAPY } from "efi/tranche/calculateTrancheAPY";

interface PrincipalTokenTermButtonLabelProps {
  tranche: Tranche | undefined;
  baseAsset: CryptoAsset | undefined;
}

/**
 * A Principal token centric display label for a tranche. This label emphasizes
 * principal token metrics rather than the underlying vault's metrics.
 */
export function PrincipalTokenTermButtonLabel({
  baseAsset,
  tranche,
}: PrincipalTokenTermButtonLabelProps): ReactElement {
  const unlockTimestampResult = useSmartContractReadCall(
    tranche,
    "unlockTimestamp"
  );

  const position = useUnderlyingVaultForTranche(tranche);
  const { data: positionName } = useSmartContractReadCall(position, "name");

  const unlockDate = convertEpochSecondsToDate(
    getQueryData(unlockTimestampResult)
  );

  const pool = usePoolForToken(tranche as ERC20Shim, jsonRpcProvider);
  const baseAssetSymbol = useCryptoSymbol(baseAsset);
  const tranchePrice = usePoolSpotPrice(pool, tranche as ERC20Shim);

  let trancheAPY = "-";
  if (tranchePrice && unlockDate) {
    trancheAPY = calculateTrancheAPY(
      tranchePrice,
      Date.now(),
      unlockDate.getTime()
    ).toFixed(2);
  }

  const formattedDate = unlockDate
    ? formatAbbreviatedDate(unlockDate)
    : t`Loading unlock date...`;

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
              {t`${trancheAPY}% APY`}
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
