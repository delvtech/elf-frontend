import { ReactElement } from "react";

import { Intent, Tag } from "@blueprintjs/core";
import { Tranche } from "elf-contracts/types/Tranche";
import { Currencies, Money } from "ts-money";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { useYearnVault } from "efi-ui/yearn/useYearnVault";
import { convertEpochSecondsToDate } from "efi/base/convertEpochSecondsToDate";
import { formatAbbreviatedDate } from "efi/base/dates";
import { formatPercent } from "efi/base/formatPercent";
import { CryptoAsset } from "efi/crypto/CryptoAsset";
import { formatMoney } from "efi/money/formatMoney";
import { getTokenInfo } from "efi/tokenlists";
import { getVaultSymbol } from "efi/vaults/getVaultSymbol";
import { PrincipalTokenInfo as TrancheInfo } from "tokenlists/types";
import { getYearnVaultAPY } from "efi-yearn/fetchYearnVaults";

interface VaultTermButtonLabelProps {
  tranche: Tranche;
  baseAsset: CryptoAsset;
}

/**
 * A Principal token centric display label for a tranche. This label emphasizes
 * principal token metrics rather than the underlying vault's metrics.
 */
export function VaultTermButtonLabel({
  baseAsset,
  tranche,
}: VaultTermButtonLabelProps): ReactElement {
  const trancheInfo = getTokenInfo<TrancheInfo>(tranche.address);
  const { unlockTimestamp } = trancheInfo.extensions;

  const vaultSymbol = getVaultSymbol(baseAsset);
  const { data: yearnVault } = useYearnVault(vaultSymbol);
  const { name: vaultName } = yearnVault || {};
  const vaultApy = yearnVault?.apy ? getYearnVaultAPY(yearnVault?.apy) : 0;
  const postedAPY = formatPercent(vaultApy);
  const formattedTVL = formatTVL(yearnVault?.tvl?.value);

  const unlockDate = convertEpochSecondsToDate(unlockTimestamp);

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
