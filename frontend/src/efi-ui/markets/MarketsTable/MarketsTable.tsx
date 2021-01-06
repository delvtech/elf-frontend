import React, { FC, useCallback } from "react";

import {
  Alignment,
  Button,
  Classes,
  HTMLTable,
  Icon,
  Switch,
} from "@blueprintjs/core";
import { Link } from "@reach/router";
import { Erc20 } from "elf-contracts/types/Erc20";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { FormGroupLabel } from "efi-ui/base/FormGroupLabel/FormGroupLabel";
import { LabeledProgressBar } from "efi-ui/base/LabeledProgressBar/LabeledProgressBar";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { useTokenName } from "efi-ui/token/hooks/useTokenName";
import { useTokenSymbol } from "efi-ui/token/hooks/useTokenSymbol";
import { useTokenTotalSupply } from "efi-ui/token/hooks/useTokenTotalSupply";
import { formatEth } from "efi/coins/ether/formatEth";
import { wethContract } from "efi/crypto/TokenContracts";
import { Pool } from "efi/pools/Pool";
import { IconNames } from "@blueprintjs/icons";
import classNames from "classnames";

interface MarketsTableProps {
  markets: Pool[];
  className?: string;
}

const TABLE_HEADERS: MarketsTableHeaderProps[] = [
  { label: t`Maturity Date` },
  { label: t`Assets` },
  { label: t`Price` },
  {
    label: t`ROI`,
    tooltip: t`The annual adjusted yield for the locked asset.`,
  },
  { label: t`Mint Date` },
  { label: t`State` },
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

interface MarketsTableRowPropsOld {
  poolContract: Erc20;
  poolId: string;
}

const MarketsTableRowOld: FC<MarketsTableRowPropsOld> = ({
  poolContract,
  poolId,
}) => {
  const [poolName] = useTokenName(poolContract);
  const [poolSymbol] = useTokenSymbol(poolContract);
  const [poolTotalSupply] = useTokenTotalSupply(poolContract);

  const onPermissionChange = useCallback(() => {}, []);

  // TOOD: get this from smart contracts when available
  const formattedPoolApy = "2.13";

  return (
    <tr>
      {/* Token name */}
      <td className={tw("h-16")}>
        <Link to="0xDEADBEEF">
          <LabeledText
            bold
            text={t`${poolSymbol} - ETH`}
            label={poolName || ""}
          />
        </Link>
      </td>

      {/* ROI */}
      <td>
        <div className={tw("flex", "h-full", "items-center")}>
          {`${formattedPoolApy}%`}
        </div>
      </td>

      {/* Price per token in staking asset */}
      <td>
        <LabeledText text={`${0.94658366} ETH`} label={`589.22 USD`} />
      </td>

      <td>
        <div className={tw("flex", "h-full", "items-center")}>
          {formatEth(poolTotalSupply)}
        </div>
      </td>

      {/* Allowance granted */}
      <td>
        <div
          onClick={(e) => {
            e.stopPropagation();
          }}
          className={tw("flex", "h-full", "items-center")}
        >
          <Switch
            large
            innerLabel={t`off`}
            innerLabelChecked={t`on`}
            className={tw("mb-0")}
            onChange={onPermissionChange}
          />
        </div>
      </td>
    </tr>
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
        <div className={tw("flex", "justify-between")}>
          <LabeledText bold text="ETH" label={t`Ether`} />
          <Icon className={Classes.TEXT_MUTED} icon={IconNames.EXCHANGE} />
          <LabeledText bold text="fyETH" label={t`Fixed Yield Ether`} />
        </div>
      </td>

      <td>{t`100 fyETH`}</td>

      <td>
        <LabeledText text={t`98.01893 ETH`} label={t`98,105.23 USD`} />
      </td>

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
