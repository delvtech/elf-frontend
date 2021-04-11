import { ReactElement } from "react";

import { Intent, Tag } from "@blueprintjs/core";
import { Tranche } from "elf-contracts/types/Tranche";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { getQueryData } from "efi-ui/base/queryResults";
import { ERC20Shim } from "efi-ui/contracts/ERC20Shim";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { useCryptoSymbol } from "efi-ui/crypto/hooks/useCryptoSymbol/useCryptoSymbol";
import { usePoolForToken } from "efi-ui/pools/usePoolForToken/usePoolForToken";
import { useUnderlyingVaultForTranche } from "efi-ui/tranche/useUnderlyingVaultForTranche";
import { convertEpochSecondsToDate } from "efi/base/convertEpochSecondsToDate";
import { formatAbbreviatedDate } from "efi/base/dates";
import { CryptoAsset } from "efi/crypto/CryptoAsset";
import { calculateTrancheAPY } from "efi/tranche/calculateTrancheAPY";
import { usePoolTokenPrices } from "efi-ui/pools/usePoolTokenPrices/usePoolTokenPrices";
import { usePoolPairedToken } from "efi-ui/pools/usePoolPairedToken/usePoolPairedToken";
import { useSmartContractFromFactory } from "efi-ui/contracts/useSmartContractFromFactory/useSmartContractFromFactory";
import { InterestToken__factory } from "elf-contracts/types/factories/InterestToken__factory";

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
  const baseAssetSymbol = useCryptoSymbol(baseAsset);
  const inputTokenSymbol = useCryptoSymbol(baseAsset);
  const {
    amountOfBaseAssetForOneTranche,
    amountOfBaseAssetForOneYieldToken,
  } = usePrincipalAndYieldTokenPrices(tranche);

  const roundedTranchePrice = amountOfBaseAssetForOneTranche?.toFixed(4);
  const principalTokenMarketRateLabel = t`1 ${inputTokenSymbol} Principal Token ≈ ${roundedTranchePrice} ${baseAssetSymbol}`;
  const roundedYieldTokenPrice = amountOfBaseAssetForOneYieldToken?.toFixed(4);
  const yieldTokenMarketRateLabel = t`1 ${inputTokenSymbol} Yield Token ≈ ${roundedYieldTokenPrice} ${baseAssetSymbol}`;

  const unlockTimestampResult = useSmartContractReadCall(
    tranche,
    "unlockTimestamp"
  );

  const position = useUnderlyingVaultForTranche(tranche);
  const { data: positionName } = useSmartContractReadCall(position, "name");

  const unlockDate = convertEpochSecondsToDate(
    getQueryData(unlockTimestampResult)
  );

  // TODO: Replace this with the posted APY on the vault
  let trancheAPY = "-";
  if (amountOfBaseAssetForOneTranche && unlockDate) {
    trancheAPY = calculateTrancheAPY(
      amountOfBaseAssetForOneTranche,
      Date.now(),
      unlockDate.getTime()
    ).toFixed(2);
  }

  const formattedDate = unlockDate
    ? formatAbbreviatedDate(unlockDate)
    : t`Loading unlock date...`;

  return (
    <div className={tw("flex", "items-center", "space-x-4")}>
      <LabeledText
        large
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
              {t`${trancheAPY}% APY`}
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
        text={t`${positionName}`}
        label={principalTokenMarketRateLabel}
        subLabel={yieldTokenMarketRateLabel}
      />
    </div>
  );
}

function usePrincipalAndYieldTokenPrices(tranche: Tranche | undefined) {
  const tranchePool = usePoolForToken(tranche as ERC20Shim);
  const baseAssetPoolToken = usePoolPairedToken(
    tranchePool,
    tranche as ERC20Shim
  );
  const {
    spotPriceBaseAssetForOneToken: amountOfBaseAssetForOneTranche,
  } = usePoolTokenPrices(tranchePool, baseAssetPoolToken);

  const { data: yieldTokenAddress } = useSmartContractReadCall(
    tranche,
    "interestToken"
  );
  const yieldToken = useSmartContractFromFactory(
    yieldTokenAddress,
    InterestToken__factory.connect
  );
  const yieldTokenPool = usePoolForToken(yieldToken as ERC20Shim);
  const {
    spotPriceBaseAssetForOneToken: amountOfBaseAssetForOneYieldToken,
  } = usePoolTokenPrices(yieldTokenPool, baseAssetPoolToken);
  return {
    amountOfBaseAssetForOneTranche,
    amountOfBaseAssetForOneYieldToken,
  };
}
