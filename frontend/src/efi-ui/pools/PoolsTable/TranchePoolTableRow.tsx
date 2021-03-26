import { FC } from "react";

import { Link } from "@reach/router";
import { ConvergentCurvePool } from "elf-contracts/types/ConvergentCurvePool";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { LabeledProgressBar } from "efi-ui/base/LabeledProgressBar/LabeledProgressBar";
import { getQueryData } from "efi-ui/base/queryResults";
import { ERC20Shim } from "efi-ui/contracts/ERC20Shim";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { usePoolPairedToken } from "efi-ui/pools/usePoolPairedToken/usePoolPairedToken";
import { useTrancheForPool } from "efi-ui/pools/useTrancheForPool/useTrancheForPool";
import { useTrancheCreatedAt } from "efi-ui/tranche/useTrancheCreatedAt";
import { convertEpochSecondsToDate } from "efi/base/convertEpochSecondsToDate";
import { getTimeLeft2 } from "efi/base/time";

interface TranchePoolTableRowProps {
  pool: ConvergentCurvePool | undefined;
}

export const TranchePoolTableRow: FC<TranchePoolTableRowProps> = ({ pool }) => {
  const tranche = useTrancheForPool(pool);
  const trancheCreatedAtResult = useTrancheCreatedAt(tranche);
  const poolNameResult = useSmartContractReadCall(pool, "name");
  const totalSupplyResult = useSmartContractReadCall(pool, "totalSupply");
  const baseAsset = usePoolPairedToken(pool, tranche as ERC20Shim);
  const unlockTimestampResult = useSmartContractReadCall(
    tranche,
    "unlockTimestamp",
    { enabled: !!tranche }
  );
  const maturityDate = convertEpochSecondsToDate(
    getQueryData(unlockTimestampResult)
  );

  const startDate = convertEpochSecondsToDate(
    getQueryData(trancheCreatedAtResult)
  );

  if (!pool || !baseAsset) {
    return null;
  }

  const totalSupply = getQueryData(totalSupplyResult);

  const timeLeft = getTimeLeft2(maturityDate);

  return (
    <tr>
      <td>{maturityDate?.toLocaleDateString()}</td>
      <td>
        <Link className={tw("flex", "space-x-2")} to={pool?.address || ""}>
          {getQueryData(poolNameResult)}
        </Link>
      </td>

      <td>${totalSupply?.toLocaleString()}</td>
      <td>2.13%</td>

      <td>{startDate?.toLocaleDateString()}</td>

      <td>
        <LabeledProgressBar
          progressValue={0.5}
          label={t`running`}
          helperText={timeLeft}
        />
      </td>
    </tr>
  );
};
