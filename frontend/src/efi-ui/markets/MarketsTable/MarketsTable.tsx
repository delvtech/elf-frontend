import React, { FC, useCallback } from "react";

import { Alignment, Classes, HTMLTable, Switch } from "@blueprintjs/core";
import { Link } from "@reach/router";
import { Erc20 } from "elf-contracts/types/Erc20";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { FormGroupLabel } from "efi-ui/base/FormGroupLabel/FormGroupLabel";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { useTokenName } from "efi-ui/token/hooks/useTokenName";
import { useTokenSymbol } from "efi-ui/token/hooks/useTokenSymbol";
import { useTokenTotalSupply } from "efi-ui/token/hooks/useTokenTotalSupply";
import { formatEth } from "efi/coins/ether/formatEth";
import { wethContract } from "efi/crypto/TokenContracts";
import { Pool } from "efi/pools/Pool";

interface MarketsTableProps {
  markets: Pool[];
  className?: string;
}

const TABLE_HEADERS: MarketsTableHeaderProps[] = [
  { label: t`Pair` },
  { label: t`ROI` },
  { label: t`Price` },
  { label: t`Balance` },
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

interface MarketsTableRowProps {
  poolContract: Erc20;
  poolId: string;
}

const MarketsTableRow: FC<MarketsTableRowProps> = ({
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
