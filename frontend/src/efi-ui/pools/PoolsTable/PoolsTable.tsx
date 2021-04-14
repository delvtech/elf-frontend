import { ReactElement } from "react";

import { Alignment, Classes, HTMLTable } from "@blueprintjs/core";
import { Provider } from "@ethersproject/providers";
import { Signer } from "ethers";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { FormGroupLabel } from "efi-ui/base/FormGroupLabel/FormGroupLabel";
import { InterestTokenPoolTableRow } from "efi-ui/pools/PoolsTable/InterestTokenPoolTableRow";
import { TranchePoolTableRow } from "efi-ui/pools/PoolsTable/TranchePoolTableRow";
import { useConvergentCurvePools } from "efi-ui/pools/useConvergentCurvePools/useConvergentCurvePools";
import { useWeightedPools } from "efi-ui/pools/useWeightedPools/useWeightedPools";

interface PoolsTableProps {
  className?: string;
  signerOrProvider?: Signer | Provider;
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

export function PoolsTable({
  className,
  signerOrProvider,
}: PoolsTableProps): ReactElement {
  const principalTokenPools = useConvergentCurvePools(signerOrProvider);
  const interestTokenPools = useWeightedPools(signerOrProvider);

  if (!principalTokenPools.length && !interestTokenPools.length) {
    return <span>{t`no markets found`}</span>;
  }

  return (
    <div className={tw("w-full")}>
      <HTMLTable striped className={className} interactive>
        <thead>
          <tr>
            {TABLE_HEADERS.map(({ label, tooltip }) => (
              <PoolsTableHeader key={label} label={label} tooltip={tooltip} />
            ))}
          </tr>
        </thead>
        <tbody className={Classes.TEXT_LARGE}>
          {principalTokenPools.map((pool, index) => {
            return (
              <TranchePoolTableRow
                key={pool?.contractAddress || index}
                pool={pool}
              />
            );
          })}
          {interestTokenPools.map((pool, index) => {
            return (
              <InterestTokenPoolTableRow
                key={pool?.contractAddress || index}
                pool={pool}
              />
            );
          })}
        </tbody>
      </HTMLTable>
    </div>
  );
}

interface PoolsTableHeaderProps {
  label: string;
  tooltip?: string;
}

function PoolsTableHeader({ label, tooltip }: PoolsTableHeaderProps) {
  return (
    <th key={label}>
      <FormGroupLabel
        label={label}
        tooltipContent={tooltip}
        alignIndicator={Alignment.RIGHT}
      />
    </th>
  );
}
