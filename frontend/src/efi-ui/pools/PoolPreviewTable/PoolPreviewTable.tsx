import React, { FC, useCallback } from "react";

import { Classes, HTMLTable } from "@blueprintjs/core";
import classNames from "classnames";
import { Erc20 } from "elf-contracts/types/Erc20";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { useTokenName } from "efi-ui/token/hooks/useTokenName";
import { useTokenSymbol } from "efi-ui/token/hooks/useTokenSymbol";
import { useTokenTotalSupply } from "efi-ui/token/hooks/useTokenTotalSupply";
import { formatEth } from "efi/coins/ether/formatEth";
import { elfContract } from "efi/contracts/Elf";
import { Pool } from "efi/pools/Pool";

interface PoolPreviewTableProps {
  onSelectPool: (strategyId: string) => void;
  pools: Pool[];
  className?: string;
}

const TABLE_HEADERS = [t`Pool`, t`APY`, t`Price`, t`USD`, t`Balance`];

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
  onSelectPool,
  className,
}) => {
  return (
    <HTMLTable striped className={className} interactive>
      <thead>
        <tr>
          {TABLE_HEADERS.map((label) => (
            <th key={label}>
              <span className={classNames(Classes.TEXT_MUTED)}>{label}</span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody className={Classes.TEXT_LARGE}>
        {POOLS.map((pool, i) => {
          return (
            <PoolPreviewTableRow
              key={i}
              pool={pool}
              poolId={pools[0].id}
              onClick={onSelectPool}
            />
          );
        })}
      </tbody>
    </HTMLTable>
  );
};

const PoolPreviewTableRow: FC<{
  pool: Erc20;
  poolId: string;
  onClick: (poolId: string) => void;
}> = ({ pool, poolId, onClick }) => {
  const { data: poolName } = useTokenName(pool);
  const { data: poolSymbol } = useTokenSymbol(pool);
  const { data: poolTotalSupply } = useTokenTotalSupply(pool);

  const onRowClick = useCallback(() => {
    onClick(poolId);
  }, [onClick, poolId]);

  return (
    <tr onClick={onRowClick}>
      {/* Token name */}
      <td className={tw("h-16")}>
        <div className={tw("flex", "flex-col", "space-y-1")}>
          <span className={tw("text-xl", "font-semibold")}>
            {poolSymbol?.[0]} - ETH
          </span>
          <span className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}>
            {poolName?.[0]}
          </span>
        </div>
      </td>

      {/* APY */}
      <td>
        <div className={tw("flex", "h-full", "items-center")}>5.16%</div>
      </td>

      {/* Price per token in staking asset */}
      <td>
        <div
          className={tw("flex", "h-full", "items-center")}
        >{`${0.94658366} ETH`}</div>
      </td>

      {/* Price per token in fiat */}

      <td>
        <div className={tw("flex", "h-full", "items-center")}>{`$589.22`}</div>
      </td>

      <td>
        <div className={tw("flex", "h-full", "items-center")}>
          {formatEth(poolTotalSupply?.[0])}
        </div>
      </td>
    </tr>
  );
};
