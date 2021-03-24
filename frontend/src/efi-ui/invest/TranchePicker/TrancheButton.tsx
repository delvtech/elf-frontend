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
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { useOnSwapGivenIn } from "efi-ui/pools/useOnSwapGivenIn/useOnSwapGivenIn";
import { usePoolForToken } from "efi-ui/pools/usePoolForToken/usePoolForToken";
import { convertEpochSecondsToDate } from "efi/base/convertEpochSecondsToDate";
import { formatAbbreviatedDate } from "efi/base/dates";
import { formatCurrency } from "efi/base/formatCurrency/formatCurrency";
import { ONE_ETHER } from "efi/crypto/ethereum";
import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";
import { calculateTrancheAPY } from "efi/tranche/calculateTrancheAPY";
import { usePositionForTranche } from "efi-ui/tranche/usePositionForTranche";
import { usePoolPairedToken } from "efi-ui/pools/usePoolPairedToken/usePoolPairedToken";
import { ERC20Shim } from "efi-ui/contracts/ERC20Shim";

interface TrancheButtonProps {
  library: Web3Provider | undefined;
  account: string | null | undefined;
  tranche: Tranche | undefined;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
}

export const TrancheButton: FC<TrancheButtonProps> = ({ tranche, onClick }) => {
  const decimalsResult = useSmartContractReadCall(tranche, "decimals");
  const unlockTimestampResult = useSmartContractReadCall(
    tranche,
    "unlockTimestamp"
  );

  const position = usePositionForTranche(tranche);
  const { data: positionName } = useSmartContractReadCall(position, "name");

  const decimals = getQueryData(decimalsResult);
  const unlockDate = convertEpochSecondsToDate(
    getQueryData(unlockTimestampResult)
  );

  const pool = usePoolForToken(tranche as ERC20Shim, jsonRpcProvider);
  const baseAssetToken = usePoolPairedToken(pool, tranche as ERC20Shim);
  const { data: baseAssetName } = useSmartContractReadCall(
    baseAssetToken,
    "symbol"
  );
  const tranchePriceResult = useOnSwapGivenIn(
    pool,
    tranche as ERC20Shim,
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
            text={`${baseAssetName} Principal Token`}
            label={t`via ${positionName}`}
          />
        </div>
        <Icon icon={IconNames.CARET_DOWN} />
      </div>
    </button>
  );
};
