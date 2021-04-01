import React, { FC } from "react";

import { Classes, Icon, Intent, Tag } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Web3Provider } from "@ethersproject/providers";
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

interface TrancheButtonProps {
  library: Web3Provider | undefined;
  account: string | null | undefined;
  tranche: Tranche | undefined;
  baseAsset: CryptoAsset | undefined;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
}

export const TrancheButton: FC<TrancheButtonProps> = ({
  baseAsset,
  tranche,
  onClick,
}) => {
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
    <button
      onClick={onClick}
      className={classNames(
        Classes.BUTTON,
        Classes.FILL,
        Classes.MINIMAL,
        tw("flex", "justify-start", "h-full")
      )}
    >
      <div
        className={tw(
          "flex",
          "justify-between",
          "items-center",
          "space-x-4",
          "flex-1",
          "p-2"
        )}
      >
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
                  "mr-4"
                )}
              >
                <span className={classNames("h4", tw("text-center"))}>
                  {t`${trancheAPY}% APY`}
                </span>
                <Tag intent={Intent.PRIMARY} fill className={tw("text-center")}>
                  {formattedDate}
                </Tag>
              </div>
            }
            text={`${baseAssetSymbol} Principal Token`}
            label={t`via ${positionName}`}
          />
        </div>
        <Icon icon={IconNames.CARET_DOWN} />
      </div>
    </button>
  );
};
