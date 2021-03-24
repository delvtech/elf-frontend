import React, { FC } from "react";

import {
  Alignment,
  Button,
  Classes,
  HTMLTable,
  Menu,
  MenuItem,
  Tag,
} from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Popover2 } from "@blueprintjs/popover2";
import { ConvergentCurvePool } from "elf-contracts/types/ConvergentCurvePool";
import { InterestToken__factory } from "elf-contracts/types/factories/InterestToken__factory";
import { WeightedPool } from "elf-contracts/types/WeightedPool";
import zip from "lodash.zip";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { FormGroupLabel } from "efi-ui/base/FormGroupLabel/FormGroupLabel";
import { getQueriesData } from "efi-ui/base/queryResults";
import { ERC20Shim } from "efi-ui/contracts/ERC20Shim";
import { useSmartContractReadCalls } from "efi-ui/contracts/useSmartContractReadCalls/useSmartContractReadCalls";
import { useSmartContractsFromFactory } from "efi-ui/contracts/useSmartContractsFromFactory/useSmartContractsFromFactory";
import { TranchePoolTableRow } from "efi-ui/pools/PoolsTable/TranchePoolTableRow";
import { YieldCouponPoolTableRow } from "efi-ui/pools/PoolsTable/YieldCouponPoolTableRow";
import { usePoolForTokenMulti } from "efi-ui/pools/usePoolForToken/usePoolForTokenMulti";
import { useTrancheContracts } from "efi-ui/tranche/useTrancheContracts";

interface PoolsTableProps {
  className?: string;
}

const TABLE_HEADERS: PoolsTableHeaderProps[] = [
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

export const PoolsTable: FC<PoolsTableProps> = ({ className }) => {
  const tranches = useTrancheContracts();
  const tranchePools = usePoolForTokenMulti(
    (tranches as unknown) as ERC20Shim[]
  ) as (ConvergentCurvePool | undefined)[];

  const interestTokenAddressResults = useSmartContractReadCalls(
    tranches,
    "interestToken"
  );
  const interestTokens = useSmartContractsFromFactory(
    getQueriesData(interestTokenAddressResults),
    InterestToken__factory.connect
  );
  const interestTokenPools = usePoolForTokenMulti(
    (interestTokens as unknown) as ERC20Shim[]
  ) as (WeightedPool | undefined)[];

  if (!tranchePools.length && !interestTokenPools.length) {
    return <span>{t`no markets found`}</span>;
  }

  const tranchePoolItems = zip(tranchePools, tranches);
  const interestTokenPoolItems = zip(
    interestTokenPools,
    interestTokens,
    tranches
  );

  return (
    <div className={tw("w-full")}>
      <div className={tw("flex", "justify-between")}>
        <div className={tw("flex", "space-x-4")}>
          <Popover2
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
            placement="bottom-end"
            minimal
          >
            <Button
              minimal
              outlined
              rightIcon={IconNames.DOUBLE_CARET_VERTICAL}
            >{t`Sort`}</Button>
          </Popover2>
          <Tag minimal onRemove={() => {}}>{t`Maturity Date`}</Tag>
          <Tag minimal onRemove={() => {}}>{t`ROI`}</Tag>
        </div>
        <Popover2
          content={
            <Menu>
              {TABLE_HEADERS.map(({ label }) => (
                <MenuItem key={label} text={label} icon={IconNames.PIN} />
              ))}
            </Menu>
          }
          placement="bottom-end"
          minimal
        >
          <Button
            minimal
            outlined
            rightIcon={IconNames.CARET_DOWN}
          >{t`Columns`}</Button>
        </Popover2>
      </div>
      <HTMLTable striped className={className} interactive>
        <thead>
          <tr>
            {TABLE_HEADERS.map(({ label, tooltip }) => (
              <PoolsTableHeader key={label} label={label} tooltip={tooltip} />
            ))}
          </tr>
        </thead>
        <tbody className={Classes.TEXT_LARGE}>
          {tranchePoolItems.map(([pool, tranche], index) => {
            return (
              <TranchePoolTableRow
                key={pool?.contractAddress || index}
                pool={pool}
                tranche={tranche}
              />
            );
          })}
          {interestTokenPoolItems.map(([pool, yieldCoupon, tranche], index) => {
            return (
              <YieldCouponPoolTableRow
                key={pool?.contractAddress || index}
                tranche={tranche}
                yieldCoupon={yieldCoupon}
                pool={pool}
              />
            );
          })}
        </tbody>
      </HTMLTable>
    </div>
  );
};

interface PoolsTableHeaderProps {
  label: string;
  tooltip?: string;
}

const PoolsTableHeader: FC<PoolsTableHeaderProps> = ({ label, tooltip }) => {
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
