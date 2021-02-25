import React, { FC, useState } from "react";
import { useInterval } from "react-use";

import {
  Alignment,
  Button,
  Classes,
  HTMLTable,
  Menu,
  MenuItem,
  Popover,
  Position,
  Tag,
} from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Link } from "@reach/router";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { FormGroupLabel } from "efi-ui/base/FormGroupLabel/FormGroupLabel";
import { LabeledProgressBar } from "efi-ui/base/LabeledProgressBar/LabeledProgressBar";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { getTimeLeft } from "efi/base/time";
import { Market } from "efi/markets/Market";
import { useMarketContracts } from "efi-ui/markets/useMarketContracts";
import { useMarkets } from "efi-ui/markets/useMarkets";
import { QueryStatus } from "react-query";

interface MarketsTableProps {
  className?: string;
}

const TABLE_HEADERS: MarketsTableHeaderProps[] = [
  { label: t`Maturity Date` },
  { label: t`Assets` },
  {
    label: t`Total Liquidity`,
  },
  {
    label: t`Pool ROI`,
    tooltip: t`The annual adjusted yield for staking in this market.`,
  },
  { label: t`Mint Date` },
  { label: t`Tranche State` },
];

export const MarketsTable: FC<MarketsTableProps> = ({ className }) => {
  const marketContracts = useMarketContracts();
  const marketResults = useMarkets(marketContracts);

  if (!marketResults.length) {
    return <span>{t`no markets found`}</span>;
  }
  return (
    <div className={tw("w-full")}>
      <div className={tw("flex", "justify-between")}>
        <div className={tw("flex", "space-x-4")}>
          <Popover
            content={
              <Menu>
                <MenuItem text={t`Name`} />
                <MenuItem text={t`Asset Type`} />
                <MenuItem text={t`Mint Date`} />
                <MenuItem text={t`Maturity Date`} />
                <MenuItem text={t`Time left`} />
                <MenuItem text={t`ROI`} />
              </Menu>
            }
            position={Position.BOTTOM_LEFT}
            minimal
          >
            <Button
              minimal
              outlined
              rightIcon={IconNames.DOUBLE_CARET_VERTICAL}
            >{t`Sort`}</Button>
          </Popover>
          <Tag minimal onRemove={() => {}}>{t`Maturity Date`}</Tag>
          <Tag minimal onRemove={() => {}}>{t`ROI`}</Tag>
        </div>
        <Popover
          content={
            <Menu>
              {TABLE_HEADERS.map(({ label }) => (
                <MenuItem key={label} text={label} icon={IconNames.PIN} />
              ))}
            </Menu>
          }
          position={Position.BOTTOM_RIGHT}
          minimal
        >
          <Button
            minimal
            outlined
            rightIcon={IconNames.CARET_DOWN}
          >{t`Columns`}</Button>
        </Popover>
      </div>
      <HTMLTable striped className={className} interactive>
        <thead>
          <tr>
            {TABLE_HEADERS.map(({ label, tooltip }) => (
              <MarketsTableHeader key={label} label={label} tooltip={tooltip} />
            ))}
          </tr>
        </thead>
        <tbody className={Classes.TEXT_LARGE}>
          {marketResults.map(([market, status], index) => {
            return (
              <MarketsTableRow
                key={market?.contractAddress || index}
                market={market}
                marketStatus={status}
              />
            );
          })}
        </tbody>
      </HTMLTable>
    </div>
  );
};

interface MarketsTableHeaderProps {
  label: string;
  tooltip?: string;
}

const MarketsTableHeader: FC<MarketsTableHeaderProps> = ({
  label,
  tooltip,
}) => {
  return (
    <th key={label}>
      <FormGroupLabel
        label={label}
        tooltipContent={tooltip}
        alignIndicator={Alignment.RIGHT}
      />
    </th>
  );
};

interface MarketsTableRowProps {
  market: Market | undefined;
  marketStatus: QueryStatus;
}
export const MarketsTableRow: FC<MarketsTableRowProps> = ({
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
