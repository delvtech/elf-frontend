import { ReactElement, useCallback, useEffect, useState } from "react";

import { Card, Classes, Colors, Elevation } from "@blueprintjs/core";
import { Link, navigate } from "@reach/router";
import classNames from "classnames";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { TimeLeft } from "efi-ui/base/TimeLeft/TimeLeft";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { findAssetIcon } from "efi-ui/crypto/CryptoIcon";
import { useCryptoAssetForToken } from "efi-ui/crypto/hooks/useCryptoAssetForToken";
import { useCryptoSymbol } from "efi-ui/crypto/hooks/useCryptoSymbol/useCryptoSymbol";
import { useBaseAssetForPool } from "efi-ui/pools/useBaseAssetForPool/useBaseAssetForPool";
import { useFeeVolumeForPool } from "efi-ui/pools/useFeeVolumeForPool/useFeeVolumeForPool";
import { usePoolPairedToken } from "efi-ui/pools/usePoolPairedToken/usePoolPairedToken";
import { useTotalLiquidityForPool } from "efi-ui/pools/useTotalLiquidityForPool/useTotalLiquidityForPool";
import { useTrancheForPool } from "efi-ui/pools/useTrancheForPool/useTrancheForPool";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { calculateProgress } from "efi-ui/tranche/calculateProgress";
import { useTermAssetSymbol } from "efi-ui/tranche/useTermAssetSymbol";
import { useTrancheCreatedAt } from "efi-ui/tranche/useTrancheCreatedAt";
import { formatMoney } from "efi/money/formatMoney";
import { PoolContract } from "efi/pools/PoolContract";

import styles from "./PrincipalPoolCard.module.css";

interface PrincipalPoolCardProps {
  pool: PoolContract | undefined;
}

const cellClassName = tw("flex", "mr-4", "items-center", "overflow-hidden");

// Stop propagation of clicks from the card title up to the card itself,
// otherwise you get double routed to /exchange/exchange/0xdeadbeef
const stopPropagationHandler = (e: React.MouseEvent<HTMLAnchorElement>) => {
  e.stopPropagation();
};

export function PrincipalPoolCard(
  props: PrincipalPoolCardProps
): ReactElement | null {
  const { pool } = props;
  const tranche = useTrancheForPool(pool);
  const liquidity = useTotalLiquidityForPool(pool);
  const trancheCreatedAt = useTrancheCreatedAt(tranche);
  const fees = useFeeVolumeForPool(pool);
  const baseAssetContract = useBaseAssetForPool(pool);
  const baseAsset = useCryptoAssetForToken(baseAssetContract?.address);
  const baseAssetSymbol = useCryptoSymbol(baseAsset);
  const BaseAssetIcon = findAssetIcon(baseAssetSymbol);
  const termAssetContract = usePoolPairedToken(pool, baseAssetContract);
  const { symbol: termAssetSymbol } = useTermAssetSymbol(
    termAssetContract?.address,
    baseAssetSymbol
  );
  const { data: unlockBN } = useSmartContractReadCall(
    tranche,
    "unlockTimestamp"
  );
  const unlockTime = unlockBN?.toNumber();

  // TODO: Get this from props
  const goToPoolPage = useCallback(() => {
    navigate(`pools/${pool?.address}`);
  }, [pool?.address]);

  const { isDarkMode } = useDarkMode();

  const allDataLoaded =
    tranche &&
    liquidity &&
    trancheCreatedAt &&
    fees &&
    baseAssetContract &&
    baseAsset &&
    baseAssetSymbol &&
    BaseAssetIcon &&
    termAssetContract &&
    termAssetSymbol &&
    unlockBN;

  const [transitionsEnabled, setTransitionsEnabled] = useState(true);

  // One tme useEffect to let us show transitions for the skeletons once the data is loaded.
  // Afterwards we disable transitions so they don't interfere with light/dark mode switching.
  useEffect(() => {
    if (allDataLoaded) {
      setTimeout(() => {
        setTransitionsEnabled(false);
      }, 1000);
    }
  }, [allDataLoaded]);

  if (!pool || !baseAssetContract) {
    return null;
  }

  const startTime = trancheCreatedAt ? trancheCreatedAt * 1000 : undefined;
  const maturityTime = unlockTime ? unlockTime * 1000 : undefined;
  const startDate = startTime ? new Date(startTime) : undefined;
  const maturityDate = maturityTime ? new Date(maturityTime) : undefined;
  const progressValue = calculateProgress(startDate, maturityDate);
  const progressLabel = progressValue === 1 ? t`closed` : `running`;

  if (!allDataLoaded) {
    return (
      <Card
        elevation={Elevation.TWO}
        interactive
        onClick={goToPoolPage}
        className={classNames(
          Classes.SKELETON,
          tw("h-24", "w-full", "transition", "duration-1000", "ease-in-out")
        )}
      ></Card>
    );
  }

  return (
    <Card
      elevation={Elevation.TWO}
      interactive
      onClick={goToPoolPage}
      className={classNames(
        styles.gridColsPoolCard,
        tw(
          "grid",
          "grid-cols-3",
          "lg:grid-cols-4",
          "xl:grid-cols-poolcard",
          "h-24",
          "w-full",
          {
            transition: transitionsEnabled,
            "duration-1000": transitionsEnabled,
            "ease-in-out": transitionsEnabled,
          }
        )
      )}
    >
      <div className={tw(cellClassName, "flex-shrink-0")}>
        {BaseAssetIcon ? (
          <div
            className={classNames(
              tw(
                "hidden",
                "md:flex",
                "items-center",
                "rounded",
                "p-2",
                "flex-shrink-0"
              )
            )}
          >
            <div
              style={{
                borderColor: isDarkMode ? Colors.GRAY5 : undefined,
                backgroundColor: isDarkMode ? Colors.WHITE : undefined,
              }}
              className={tw(
                "flex",
                "flex-shrink-0",
                "items-center",
                "p-2",
                "rounded-full",
                "z-10",
                "bg-white",
                "border",
                "shadow-sm"
              )}
            >
              <BaseAssetIcon height={24} width={24} />
            </div>
            <div
              style={{ marginLeft: -8 }}
              className={tw(
                "flex",
                "flex-shrink-0",
                "items-center",
                "p-2",
                "rounded-full",
                "bg-white",
                "border"
              )}
            >
              <BaseAssetIcon height={24} width={24} />
            </div>
          </div>
        ) : null}
        <LabeledText
          large
          text={
            <Link
              className={tw("flex", "space-x-2")}
              to={pool?.address || ""}
              onClick={stopPropagationHandler}
            >
              {`${baseAssetSymbol} - ${termAssetSymbol}`}
            </Link>
          }
          label={`tokens`}
        />
      </div>

      <div className={tw(cellClassName)}>
        <LabeledText
          large
          text={formatMoney(liquidity, { wholeAmounts: true })}
          label={`liquidity`}
        />
      </div>
      <div className={tw(cellClassName, "hidden", "lg:flex")}>
        <LabeledText
          large
          text={formatMoney(fees, { wholeAmounts: true })}
          label={`Fees`}
        />
      </div>
      <div className={tw(cellClassName, "hidden", "xl:flex")}>
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
        <TimeLeft
          label={progressLabel}
          startDate={startTime}
          maturityDate={maturityTime}
        />
      </div>
    </Card>
  );
}
