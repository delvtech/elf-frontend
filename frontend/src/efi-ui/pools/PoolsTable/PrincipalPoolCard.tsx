import { ReactElement } from "react";

import { Card, Elevation } from "@blueprintjs/core";
import { Link } from "@reach/router";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { LabeledProgressBar } from "efi-ui/base/LabeledProgressBar/LabeledProgressBar";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { getQueryData } from "efi-ui/base/queryResults";
import { ERC20Shim } from "efi-ui/contracts/ERC20Shim";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { usePoolPairedToken } from "efi-ui/pools/usePoolPairedToken/usePoolPairedToken";
import { useTrancheForPool } from "efi-ui/pools/useTrancheForPool/useTrancheForPool";
import { useTrancheCreatedAt } from "efi-ui/tranche/useTrancheCreatedAt";
import { convertEpochSecondsToDate } from "efi/base/convertEpochSecondsToDate";
import { getTimeLeft2 } from "efi/base/time";
import { formatMoney } from "efi/money/formatMoney";
import { PoolContract } from "efi/pools/PoolContract";

import { useTotalLiquidityForPool } from "../useTotalLiquidityForPool/useTotalLiquidityForPool";

interface PrincipalPoolCardProps {
  pool: PoolContract | undefined;
}

const cellClassName = tw("flex", "mr-4", "items-center", "overflow-hidden");

export function PrincipalPoolCard({
  pool,
}: PrincipalPoolCardProps): ReactElement | null {
  const tranche = useTrancheForPool(pool);
  const liquidity = useTotalLiquidityForPool(pool);
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

  const startDate = convertEpochSecondsToDate(
    getQueryData(trancheCreatedAtResult)
  );

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
    <Card
      elevation={Elevation.TWO}
      interactive
      className={tw("grid", "grid-cols-3", "lg:grid-cols-5", "w-full", "grid")}
    >
      <div className={cellClassName}>
        <LabeledText
          large
          text={
            <Link className={tw("flex", "space-x-2")} to={pool?.address || ""}>
              {getQueryData(poolNameResult)}
            </Link>
          }
          label={`tokens`}
        />
      </div>

      <div className={tw(cellClassName, "hidden", "lg:flex")}>
        <LabeledText large text={formatMoney(liquidity)} label={`liquidity`} />
      </div>
      <div className={tw(cellClassName, "hidden", "lg:flex")}>
        <LabeledText large text={formatMoney(liquidity)} label={`ROI`} />
      </div>
      <div className={tw(cellClassName, "flex-wrap")}>
        <LabeledText
          className={tw("mr-4")}
          large
          text={maturityDate?.toLocaleDateString()}
          label={`start date`}
        />
        <LabeledText
          large
          text={startDate?.toLocaleDateString()}
          label={`end date`}
        />
      </div>
      <div className={cellClassName}>
        <LabeledProgressBar
          label={progressLabel}
          progressValue={progressValue}
          helperText={timeLeft}
        />
      </div>
    </Card>
  );
}
