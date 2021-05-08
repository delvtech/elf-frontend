import { ReactElement } from "react";

import { Intent, Tag } from "@blueprintjs/core";
import { Tranche } from "elf-contracts/types/Tranche";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { getQueryData } from "efi-ui/base/queryResults";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { convertEpochSecondsToDate } from "efi/base/convertEpochSecondsToDate";
import { formatAbbreviatedDate } from "efi/base/dates";
import { CryptoAsset } from "efi/crypto/CryptoAsset";
import { useYearnVault } from "efi-ui/yearn/useYearnVault";
import { formatPercent } from "efi/base/formatPercent";
import { Currencies, Money } from "ts-money";
import { formatMoney } from "efi/money/formatMoney";
import { getVaultSymbol } from "efi/vaults/getVaultSymbol";

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

  const vaultSymbol = getVaultSymbol(baseAsset);
  const { data: yearnVault } = useYearnVault(vaultSymbol);
  const { name: vaultName } = yearnVault || {};
  const postedAPY = formatPercent(yearnVault?.apy?.recommended || 0);
  const formattedTVL = formatTVL(yearnVault?.tvl?.value);

  const unlockDate = convertEpochSecondsToDate(
    getQueryData(unlockTimestampResult)
  );

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
              {t`${postedAPY} APY`}
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
        text={t`Yearn ${vaultName}`}
        label={
          <span className={tw("text-base")}>{t`TVL: ${formattedTVL}`}</span>
        }
      />
    </div>
  );
}
function formatTVL(tvl: string | undefined) {
  const nearestCent = Math.round(+(tvl || 0)) * 100;
  const tvlMoney = new Money(nearestCent, Currencies.USD);
  const formattedTVL = formatMoney(tvlMoney, { wholeAmounts: true });
  return formattedTVL;
}
