import React, { FC } from "react";
import { Classes, Colors, Icon, Tag } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Web3Provider } from "@ethersproject/providers";
import classNames from "classnames";
import { Tranche } from "elf-contracts/types/Tranche";
import { t } from "ttag";
import tw from "efi-tailwindcss-classnames";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { getQueryData } from "efi-ui/base/queryResults";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { useOnSwapGivenIn } from "efi-ui/pools/useOnSwapGivenIn/useOnSwapGivenIn";
import { usePoolForToken } from "efi-ui/pools/usePoolForToken/usePoolForToken";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { convertEpochSecondsToDate } from "efi/base/convertEpochSecondsToDate";
import {
  formatAbbreviatedDate,
  formatAbbreviatedMonthAndDay,
} from "efi/base/dates";
import { formatCurrency } from "efi/base/formatCurrency/formatCurrency";
import { ONE_ETHER } from "efi/crypto/ethereum";
import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";
import { calculateTrancheAPY } from "efi/tranche/calculateTrancheAPY";
import { usePositionForTranche } from "efi-ui/tranche/usePositionForTranche";
import { usePoolPairedToken } from "efi-ui/pools/usePoolPairedToken/usePoolPairedToken";

export const TrancheButton: FC<TrancheButtonProps> = ({
  library,
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

  const position = usePositionForTranche(tranche);
  const { data: positionName } = useSmartContractReadCall(position, "name");

  const symbol = getQueryData(symbolResult);
  const decimals = getQueryData(decimalsResult);
  const unlockDate = convertEpochSecondsToDate(
    getQueryData(unlockTimestampResult)
  );

  const pool = usePoolForToken(tranche, jsonRpcProvider);
  const baseAssetToken = usePoolPairedToken(pool, tranche);
  const { data: baseAssetName } = useSmartContractReadCall(
    baseAssetToken,
    "symbol"
  );
  const tranchePriceResult = useOnSwapGivenIn(
    pool,
    tranche,
    ONE_ETHER // TODO: make this 1 of the tranche asset instead
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

  const formattedDate = unlockDate
    ? formatAbbreviatedDate(unlockDate)
    : t`Loading unlock date...`;

  const formattedMonthAndDay = unlockDate
    ? formatAbbreviatedMonthAndDay(unlockDate)
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
          <div
            className={classNames(
              tw("flex", "flex-col", "items-center", "justify-center")
            )}
          >
            <span className={classNames("h4", tw("text-center"))}>
              {formattedDate}
            </span>
            <Tag
              fill
              className={tw("text-center")}
            >{t`${trancheAPY}% APY`}</Tag>
          </div>
          <LabeledText
            large
            text={`${baseAssetName} Principal Token`}
            label={positionName}
          />
        </div>
        <Icon icon={IconNames.CARET_DOWN} />
      </div>
    </button>
  );
};
interface TrancheButtonProps {
  library: Web3Provider | undefined;
  account: string | null | undefined;
  tranche: Tranche | undefined;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
}
