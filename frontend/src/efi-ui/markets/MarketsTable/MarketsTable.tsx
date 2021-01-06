import React, { FC } from "react";

import {
  Alignment,
  Button,
  Classes,
  HTMLTable,
  Icon,
  Menu,
  MenuItem,
  Popover,
  Position,
  Tag,
} from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Link } from "@reach/router";
import classNames from "classnames";
import { Erc20 } from "elf-contracts/types/Erc20";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { FormGroupLabel } from "efi-ui/base/FormGroupLabel/FormGroupLabel";
import { LabeledProgressBar } from "efi-ui/base/LabeledProgressBar/LabeledProgressBar";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { wethContract } from "efi/crypto/TokenContracts";
import { Pool } from "efi/pools/Pool";

interface MarketsTableProps {
  markets: Pool[];
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
  {
    label: t`Wallet approval`,
    tooltip: t`Wallet approval is required before a pool can invest your funds`,
  },
];

export const MarketsTable: FC<MarketsTableProps> = ({ markets, className }) => {
  if (!markets.length) {
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
          {markets.map((pool, i) => {
            return (
              <MarketsTableRow
                key={i}
                poolContract={wethContract}
                poolId={pool.id}
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
  poolContract: Erc20;
  poolId: string;
}
export const MarketsTableRow: FC<MarketsTableRowProps> = () => {
  return (
    <tr>
      <td>{t`January 15, 2021`}</td>
      <td>
        <Link className={tw("flex", "space-x-2")} to="0xDEADBEEF">
          <LabeledText bold text="ETH" label={t`Ether`} />
          <Icon className={Classes.TEXT_MUTED} icon={IconNames.EXCHANGE} />
          <LabeledText bold text="fyETH" label={t`Fixed Yield Ether`} />
        </Link>
      </td>

      <td>$123,456,789</td>
      <td>2.13%</td>

      <td>{"January 1, 2021"}</td>

      <td>
        <span className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}>
          Running
        </span>
        <LabeledProgressBar
          progressValue={0.75}
          label={t`3 days, 6 hours, 32 minutes left`}
        />
      </td>

      <td>
        <div className={tw("flex", "space-x-2")}>
          <Button outlined>{t`Approve Staking`}</Button>
        </div>
      </td>
    </tr>
  );
};
