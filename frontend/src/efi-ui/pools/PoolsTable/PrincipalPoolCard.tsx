import { ReactElement, useCallback, useMemo } from "react";

import { Card, Elevation } from "@blueprintjs/core";
import { Link, navigate } from "@reach/router";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { LabeledProgressBar } from "efi-ui/base/LabeledProgressBar/LabeledProgressBar";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { getQueryData } from "efi-ui/base/queryResults";
import { ERC20Shim } from "efi-ui/contracts/ERC20Shim";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { usePoolPairedToken } from "efi-ui/pools/usePoolPairedToken/usePoolPairedToken";
import { useTotalLiquidityForPool } from "efi-ui/pools/useTotalLiquidityForPool/useTotalLiquidityForPool";
import { useTrancheForPool } from "efi-ui/pools/useTrancheForPool/useTrancheForPool";
import { useTrancheCreatedAt } from "efi-ui/tranche/useTrancheCreatedAt";
import { convertEpochSecondsToDate } from "efi/base/convertEpochSecondsToDate";
import { getTimeLeft2 } from "efi/base/time";
import { formatMoney } from "efi/money/formatMoney";
import { PoolContract } from "efi/pools/PoolContract";
import { calculateProgress } from "efi-ui/tranche/calculateProgress";

interface PrincipalPoolCardProps {
  pool: PoolContract | undefined;
}

const cellClassName = tw("flex", "mr-4", "items-center", "overflow-hidden");

export function PrincipalPoolCard(
  props: PrincipalPoolCardProps
): ReactElement | null {
  const { pool } = props;
  const tranche = useTrancheForPool(pool);
  const liquidity = useTotalLiquidityForPool(pool);
  const trancheCreatedAt = useTrancheCreatedAt(tranche);
  const poolNameResult = useSmartContractReadCall(pool, "name");
  const baseAsset = usePoolPairedToken(pool, tranche as ERC20Shim);
  const unlockTimestampResult = useSmartContractReadCall(
    tranche,
    "unlockTimestamp"
  );
  const goToPoolPage = useCallback(
    () => navigate(`exchange/${pool?.address}`),
    [pool?.address]
  );
  const unlockTimestamp = getQueryData(unlockTimestampResult);
  const maturityDate = useMemo(
    () => convertEpochSecondsToDate(unlockTimestamp),
    [unlockTimestamp]
  );

  const startDate = useMemo(() => convertEpochSecondsToDate(trancheCreatedAt), [
    trancheCreatedAt,
  ]);

  if (!pool || !baseAsset) {
    return null;
  }

  const progressValue = calculateProgress(startDate, maturityDate);
  const progressLabel = progressValue === 1 ? t`closed` : `running`;
  const timeLeft = getTimeLeft2(maturityDate);

  return (
    <Card
      elevation={Elevation.TWO}
      interactive
      onClick={goToPoolPage}
      className={tw(
        "grid",
        "grid-cols-3",
        "lg:grid-cols-5",
        "h-24",
        "w-full",
        "grid"
      )}
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
