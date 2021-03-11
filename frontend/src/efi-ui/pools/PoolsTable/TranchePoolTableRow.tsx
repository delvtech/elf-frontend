import { FC } from "react";

import { Link } from "@reach/router";
import { Tranche } from "elf-contracts/types/Tranche";
import { YieldCurvePool } from "elf-contracts/types/YieldCurvePool";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { LabeledProgressBar } from "efi-ui/base/LabeledProgressBar/LabeledProgressBar";
import { getQueryData } from "efi-ui/base/queryResults";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { usePoolPairedToken } from "efi-ui/pools/usePoolPairedToken/usePoolPairedToken";
import { convertEpochSecondsToDate } from "efi/base/convertEpochSecondsToDate";
import { getTimeLeft2 } from "efi/base/time";

interface TranchePoolTableRowProps {
  pool: YieldCurvePool | undefined;

  tranche: Tranche | undefined;
}

export const TranchePoolTableRow: FC<TranchePoolTableRowProps> = ({
  pool,
  tranche,
}) => {
  const poolNameResult = useSmartContractReadCall(pool, "name");
  const totalSupplyResult = useSmartContractReadCall(pool, "totalSupply");
  const baseAsset = usePoolPairedToken(pool, tranche);
  const unlockTimestampResult = useSmartContractReadCall(
    tranche,
    "unlockTimestamp"
  );
  const maturityDate = convertEpochSecondsToDate(
    getQueryData(unlockTimestampResult)
  );

  if (!pool || !baseAsset) {
    return null;
  }

  const totalSupply = getQueryData(totalSupplyResult);
  // TODO: Convert total supply to fiat

  const startDate = new Date(pool?.startDate);

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

      <td>{startDate.toLocaleDateString()}</td>

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
