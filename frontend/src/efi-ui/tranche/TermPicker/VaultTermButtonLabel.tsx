import { ReactElement } from "react";

import { Intent, Tag } from "@blueprintjs/core";
import { Tranche } from "elf-contracts/types/Tranche";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { getQueryData } from "efi-ui/base/queryResults";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { useUnderlyingVaultForTranche } from "efi-ui/tranche/useUnderlyingVaultForTranche";
import { convertEpochSecondsToDate } from "efi/base/convertEpochSecondsToDate";
import { formatAbbreviatedDate } from "efi/base/dates";
import { CryptoAsset } from "efi/crypto/CryptoAsset";
import { useYearnVault } from "efi-ui/yearn/useYearnVault";

interface VaultTermButtonLabelProps {
  tranche: Tranche | undefined;
  baseAsset: CryptoAsset | undefined;
}

/**
 * A Principal token centric display label for a tranche. This label emphasizes
 * principal token metrics rather than the underlying vault's metrics.
 */
export function VaultTermButtonLabel({
  baseAsset,
  tranche,
}: VaultTermButtonLabelProps): ReactElement {
  const unlockTimestampResult = useSmartContractReadCall(
    tranche,
    "unlockTimestamp"
  );

  const underlyingVault = useUnderlyingVaultForTranche(tranche);
  const { data: vaultName } = useSmartContractReadCall(underlyingVault, "name");
  const { data: vaultSymbol } = useSmartContractReadCall(
    underlyingVault,
    "symbol"
  );
  const [yearnVault] = useYearnVault(vaultSymbol);

  const unlockDate = convertEpochSecondsToDate(
    getQueryData(unlockTimestampResult)
  );

  // TODO: Replace this with the posted APY on the vault
  const postedAPY = "-";

  const formattedDate = unlockDate
    ? formatAbbreviatedDate(unlockDate)
    : t`Loading unlock date...`;

  return (
    <div className={tw("flex", "items-center", "space-x-4")}>
      <LabeledText
        icon={
          <div
            className={tw(
              "flex",
              "flex-col",
              "items-center",
              "justify-center",
              "mr-4",
              "space-y-1"
            )}
          >
            <span className={tw("text-center", "text-lg")}>
              {t`${postedAPY}% APY`}
            </span>
            <Tag
              intent={Intent.PRIMARY}
              large
              fill
              className={tw("text-center")}
            >
              {formattedDate}
            </Tag>
          </div>
        }
        large
        text={vaultName}
        label={vaultSymbol}
      />
    </div>
  );
}
