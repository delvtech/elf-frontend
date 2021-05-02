import { ReactElement } from "react";

import { Link } from "@reach/router";
import { WeightedPool } from "elf-contracts/types/WeightedPool";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { LabeledProgressBar } from "efi-ui/base/LabeledProgressBar/LabeledProgressBar";
import { getQueryData } from "efi-ui/base/queryResults";
import { ERC20Shim } from "efi-ui/contracts/ERC20Shim";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { useInterestTokenForPool } from "efi-ui/pools/useInterestTokenForPool/useInterestTokenForPool";
import { usePoolPairedToken } from "efi-ui/pools/usePoolPairedToken/usePoolPairedToken";
import { useTotalFiatLiquidityForPool } from "efi-ui/pools/useTotalFiatLiquidityForPool.ts/useTotalFiatLiquidityForPool";
import { useTrancheCreatedAt } from "efi-ui/tranche/useTrancheCreatedAt";
import { useTrancheForInterestToken } from "efi-ui/tranche/useTrancheForInterestToken";
import { convertEpochSecondsToDate } from "efi/base/convertEpochSecondsToDate";
import { getTimeLeft2 } from "efi/base/time";

interface InterestTokenPoolCardProps {
  pool: WeightedPool | undefined;
}

export function InterestTokenPoolCard({
  pool,
}: InterestTokenPoolCardProps): ReactElement | null {
  const interestToken = useInterestTokenForPool(pool);
  const tranche = useTrancheForInterestToken(interestToken);

  const liquidity = useTotalFiatLiquidityForPool(pool);
  const trancheCreatedAtResult = useTrancheCreatedAt(tranche);
  const poolNameResult = useSmartContractReadCall(pool, "name");
  const baseAsset = usePoolPairedToken(pool, tranche as ERC20Shim);
  const unlockTimestampResult = useSmartContractReadCall(
    tranche,
    "unlockTimestamp"
  );
  const maturityDate = convertEpochSecondsToDate(
    getQueryData(unlockTimestampResult)
  );

  const startDate = convertEpochSecondsToDate(trancheCreatedAtResult);

  if (!pool || !baseAsset) {
    return null;
  }

  const currentTime = Date.now();
  const endTime = maturityDate?.getTime() ?? 0;
  const startTime = startDate?.getTime() ?? 0;
  // bind progress value between 0 and 1
  const progressValue = Math.max(
    0,
    Math.min(1, (currentTime - startTime) / (endTime - startTime))
  );
  const progressLabel = progressValue === 1 ? t`closed` : `running`;
  const timeLeft = getTimeLeft2(maturityDate);

  return (
    <tr>
      <td>{maturityDate?.toLocaleDateString()}</td>
      <td>
        <Link className={tw("flex", "space-x-2")} to={pool?.address || ""}>
          {getQueryData(poolNameResult)}
        </Link>
      </td>

      <td>${liquidity?.toDecimal()?.toLocaleString()}</td>
      <td>2.13%</td>

      <td>{startDate?.toLocaleDateString()}</td>

      <td>
        <LabeledProgressBar
          progressValue={progressValue}
          label={progressLabel}
          helperText={timeLeft}
        />
      </td>
    </tr>
  );
}
