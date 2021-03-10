import React, { FC, useState } from "react";
import { QueryStatus } from "react-query";
import { useInterval } from "react-use";

import { Link } from "@reach/router";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { LabeledProgressBar } from "efi-ui/base/LabeledProgressBar/LabeledProgressBar";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { getTimeLeft } from "efi/base/time";
import { Market } from "efi/markets/Market";

/**
 * @deprecated BPool is deprecated use PoolTableRow instead.
 */
export const MarketsTableRowOld: FC<MarketsTableRowProps> = ({
  market,
  marketStatus,
}) => {
  const [timerValue, setTimerValue] = useState(Date.now());
  // TODO: make timer helper fn
  useInterval(() => {
    if (!market) {
      return;
    }
    setTimerValue(market.maturityDate - Date.now());
  }, 1000);

  // TODO: make this better
  if (!market && marketStatus === "loading") {
    return (
      <tr>
        <td>loading</td>
      </tr>
    );
  }

  if (!market) {
    return null;
  }

  // TODO: make progress helper fn
  const progress =
    (Date.now() - market.startDate) / (market.maturityDate - market.startDate);

  const { totalSupply } = market;
  const startDate = new Date(market?.startDate);
  const maturityDate = new Date(market?.maturityDate);
  const baseAsset = market.assets[0];
  const yieldAsset = market.assets[1];

  const [daysLeft, hoursLeft, minutesLeft] = getTimeLeft(timerValue);
  const time = t`${daysLeft} days, ${hoursLeft}, hours, ${minutesLeft} minutes`;

  return (
    <tr>
      <td>{maturityDate.toLocaleDateString()}</td>
      <td>
        <Link className={tw("flex", "space-x-2")} to={market.contractAddress}>
          <LabeledText bold text={baseAsset.symbol} label={baseAsset.name} />
          {"-"}
          <LabeledText bold text={yieldAsset.symbol} label={yieldAsset.name} />
        </Link>
      </td>

      <td>${totalSupply?.toLocaleString()}</td>
      <td>2.13%</td>

      <td>{startDate.toLocaleDateString()}</td>

      <td>
        {market.state === "running" ? (
          <LabeledProgressBar
            progressValue={progress}
            label={t`running`}
            helperText={time}
          />
        ) : (
          market.state
        )}
      </td>
    </tr>
  );
};
interface MarketsTableRowProps {
  market: Market | undefined;
  marketStatus: QueryStatus;
}
