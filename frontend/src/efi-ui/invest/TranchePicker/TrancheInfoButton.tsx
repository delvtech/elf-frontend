import React, { FC } from "react";

import { Classes, Colors, Icon, Tag } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import classNames from "classnames";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { formatAbbreviatedDate } from "efi/base/dates";
import { Tranche } from "elf-contracts/types/Tranche";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { getQueryData } from "efi-ui/base/queryResults";
import { useMarketSpotPrice } from "efi-ui/markets/useMarketSpotPrice";
import { useMarketForToken } from "efi-ui/markets/useMarketForToken";
import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";
import { calculateTrancheAPY } from "efi/tranche/calculateTrancheAPY";
import { formatCurrency } from "efi/base/formatCurrency/formatCurrency";
import { convertEpochSecondsToDate } from "efi/base/convertEpochSecondsToDate";

interface TrancheInfoButtonProps {
  tranche: Tranche | undefined;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export const TrancheInfoButton: FC<TrancheInfoButtonProps> = ({
  tranche,
  onClick,
}) => {
  const { isDarkMode } = useDarkMode();
  const symbolResult = useSmartContractReadCall(tranche, "symbol");
  const decimalsResult = useSmartContractReadCall(tranche, "decimals");
  const unlockTimestampResult = useSmartContractReadCall(
    tranche,
    "unlockTimestamp"
  );

  const symbol = getQueryData(symbolResult);
  const decimals = getQueryData(decimalsResult);
  const unlockDate = convertEpochSecondsToDate(
    getQueryData(unlockTimestampResult)
  );

  const marketContract = useMarketForToken(tranche, jsonRpcProvider);
  const tranchePriceResult = useMarketSpotPrice(marketContract, tranche);
  const tranchePriceBigNumber = getQueryData(tranchePriceResult);
  const tranchePrice = +formatCurrency(tranchePriceBigNumber, decimals);

  let apy = "-";
  if (tranchePrice && unlockDate) {
    apy = calculateTrancheAPY(
      tranchePrice,
      Date.now(),
      unlockDate.getTime()
    ).toFixed(2);
  }

  const redeemableDate = unlockDate
    ? formatAbbreviatedDate(unlockDate)
    : t`Loading unlock date...`;

  return (
    <button
      onClick={onClick}
      className={classNames(
        Classes.BUTTON,
        Classes.OUTLINED,
        tw("w-full", "p-4", "justify-between")
      )}
    >
      <div
        className={tw(
          "flex",
          "justify-between",
          "items-center",
          "space-x-4",
          "flex-1"
        )}
      >
        <div className={tw("flex", "items-center", "space-x-4")}>
          <div
            className={classNames(
              tw(
                "flex",
                "flex-col",
                "space-y-2",
                "items-center",
                "justify-center"
              )
            )}
          >
            <span className={tw("text-lg", "text-center")}>{t`${apy}%`}</span>
            <Tag
              minimal
              style={{
                backgroundColor: isDarkMode ? Colors.COBALT3 : Colors.COBALT4,
                color: Colors.WHITE,
              }}
            >
              <div>{"Fixed APY"}</div>
            </Tag>
          </div>
          <LabeledText
            large
            text={t`Earn yield until ${redeemableDate}`}
            label={t`${symbol}`}
          />
        </div>
        <Icon icon={IconNames.CARET_DOWN} />
      </div>
    </button>
  );
};
