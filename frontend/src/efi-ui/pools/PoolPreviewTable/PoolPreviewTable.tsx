import React, { FC, useCallback } from "react";

import { Alignment, Classes, HTMLTable, Switch } from "@blueprintjs/core";
import { useNavigate } from "@reach/router";
import { Erc20 } from "elf-contracts/types/Erc20";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { FormGroupLabel } from "efi-ui/base/FormGroupLabel/FormGroupLabel";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { Navigation } from "efi-ui/navigation/navigation";
import { useTokenName } from "efi-ui/token/hooks/useTokenName";
import { useTokenSymbol } from "efi-ui/token/hooks/useTokenSymbol";
import { useTokenTotalSupply } from "efi-ui/token/hooks/useTokenTotalSupply";
import { formatEth } from "efi/coins/ether/formatEth";
import { elfContract } from "efi/contracts/Elf";
import { Pool } from "efi/pools/Pool";
import classNames from "classnames";

interface PoolPreviewTableProps {
  pools: Pool[];
  className?: string;
}

const TABLE_HEADERS: PoolPreviewTableHeaderProps[] = [
  { label: t`Pair` },
  { label: t`ROI` },
  { label: t`Price` },
  { label: t`Balance` },
  {
    label: t`Wallet approval`,
    tooltip: t`Wallet approval is required before a pool can invest your funds`,
  },
];

const POOLS = [
  elfContract,
  elfContract,
  elfContract,
  elfContract,
  elfContract,
  elfContract,
  elfContract,
];

export const PoolPreviewTable: FC<PoolPreviewTableProps> = ({
  pools,
  className,
}) => {
  return (
    <HTMLTable striped className={className} interactive>
      <thead>
        <tr>
          {TABLE_HEADERS.map(({ label, tooltip }) => (
            <PoolPreviewTableHeader
              key={label}
              label={label}
              tooltip={tooltip}
            />
          ))}
        </tr>
      </thead>
      <tbody className={Classes.TEXT_LARGE}>
        {POOLS.map((pool, i) => {
          return (
            <PoolPreviewTableRow
              key={i}
              poolContract={pool}
              poolId={pools[0].id}
            />
          );
        })}
      </tbody>
    </HTMLTable>
  );
};

interface PoolPreviewTableHeaderProps {
  label: string;
  tooltip?: string;
}

const PoolPreviewTableHeader: FC<PoolPreviewTableHeaderProps> = ({
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

interface PoolPreviewTableRowProps {
  poolContract: Erc20;
  poolId: string;
}

const PoolPreviewTableRow: FC<PoolPreviewTableRowProps> = ({
  poolContract,
  poolId,
}) => {
  const [poolName] = useTokenName(poolContract);
  const [poolSymbol] = useTokenSymbol(poolContract);
  const [poolTotalSupply] = useTokenTotalSupply(poolContract);
  const navigate = useNavigate();

  const onPermissionChange = useCallback(() => {}, []);

  const formattedPoolApy = "2.13%";

  const onRowClick = useCallback(() => {
    navigate(`${Navigation.POOLS}/${poolId}`);
  }, [navigate, poolId]);

  return (
    <tr onClick={onRowClick}>
      {/* Token name */}
      <td className={tw("h-16")}>
        {/* button for a11y, this allows users to TAB through our UI */}
        <button className={classNames(Classes.BUTTON_TEXT, tw("text-left"))}>
          <LabeledText
            bold
            text={t`${poolSymbol} - ETH`}
            label={poolName || ""}
          />
        </button>
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
