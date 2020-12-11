import React, { FC, useCallback } from "react";

import { Alignment, Classes, HTMLTable, Switch } from "@blueprintjs/core";
import { useNavigate } from "@reach/router";
import classNames from "classnames";
import { Erc20 } from "elf-contracts/types/Erc20";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { FormGroupLabel } from "efi-ui/base/FormGroupLabel/FormGroupLabel";
import { Navigation } from "efi-ui/navigation/navigation";
import { useElfProxyGetPoolAPY } from "efi-ui/pools/hooks/elfProxy";
import { useTokenName } from "efi-ui/token/hooks/useTokenName";
import { useTokenSymbol } from "efi-ui/token/hooks/useTokenSymbol";
import { useTokenTotalSupply } from "efi-ui/token/hooks/useTokenTotalSupply";
import { formatAPY } from "efi/base/formatAPY/formatAPY";
import { formatEth } from "efi/coins/ether/formatEth";
import { elfContract } from "efi/contracts/Elf";
import { Pool } from "efi/pools/Pool";

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
            <PoolPreviewTableRow key={i} pool={pool} poolId={pools[0].id} />
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

const PoolPreviewTableRow: FC<{
  pool: Erc20;
  poolId: string;
}> = ({ pool, poolId }) => {
  const { data: poolName } = useTokenName(pool);
  const { data: poolSymbol } = useTokenSymbol(pool);
  const { data: poolTotalSupply } = useTokenTotalSupply(pool);
  const navigate = useNavigate();

  const onPermissionChange = useCallback(() => {}, []);

  const { data: poolApy } = useElfProxyGetPoolAPY(pool);
  const formattedPoolApy = formatAPY(poolApy?.[0]);

  const onRowClick = useCallback(() => {
    navigate(`${Navigation.POOLS}/${poolId}`);
  }, [navigate, poolId]);

  return (
    <tr onClick={onRowClick}>
      {/* Token name */}
      <td className={tw("h-16")}>
        <div
          className={tw(
            "flex",
            "flex-col",
            "h-full",
            "w-full",
            "justify-center",
            "space-y-1"
          )}
        >
          <span className={tw("font-semibold")}>{poolSymbol?.[0]} - ETH</span>
          <span className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}>
            {poolName?.[0]}
          </span>
        </div>
      </td>

      {/* ROI */}
      <td>
        <div className={tw("flex", "h-full", "items-center")}>
          {`${formattedPoolApy}%`}
        </div>
      </td>

      {/* Price per token in staking asset */}
      <td>
        <div
          className={tw(
            "flex",
            "h-full",
            "flex-col",
            "w-full",
            "justify-center",
            "space-y-1"
          )}
        >
          <span>{`${0.94658366} ETH`}</span>
          <span
            className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}
          >{`589.22 USD`}</span>
        </div>
      </td>

      <td>
        <div className={tw("flex", "h-full", "items-center")}>
          {formatEth(poolTotalSupply?.[0])}
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
