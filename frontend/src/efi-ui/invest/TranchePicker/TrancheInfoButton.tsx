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
import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";
import { calculateTrancheAPY } from "efi/tranche/calculateTrancheAPY";
import { formatCurrency } from "efi/base/formatCurrency/formatCurrency";
import { convertEpochSecondsToDate } from "efi/base/convertEpochSecondsToDate";
import { usePoolForToken } from "efi-ui/pools/usePoolForToken/usePoolForToken";
import { useOnSwapGivenIn } from "efi-ui/pools/useOnSwapGivenIn/useOnSwapGivenIn";
import { BigNumber } from "ethers";

interface TrancheInfoButtonProps {
  account: string | null | undefined;
  tranche: Tranche | undefined;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export const TrancheInfoButton: FC<TrancheInfoButtonProps> = ({
  account,
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

  const poolContract = usePoolForToken(tranche, jsonRpcProvider);
  const tranchePriceResult = useOnSwapGivenIn(
    poolContract,
    account,
    tranche,
    BigNumber.from(1)
  );
  const tranchePriceBigNumber = getQueryData(tranchePriceResult);
  const tranchePrice = +formatCurrency(tranchePriceBigNumber, decimals);

  let trancheAPY = "-";
  if (tranchePrice && unlockDate) {
    trancheAPY = calculateTrancheAPY(
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
            <span
              className={tw("text-lg", "text-center")}
            >{t`${trancheAPY}%`}</span>
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
            label={symbol}
          />
        </div>
        <Icon icon={IconNames.CARET_DOWN} />
      </div>
    </button>
  );
};
