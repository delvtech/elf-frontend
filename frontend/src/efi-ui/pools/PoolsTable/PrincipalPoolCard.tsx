import {
  CSSProperties,
  ReactElement,
  useCallback,
  useEffect,
  useState,
} from "react";

import { Button, Card, Classes, Colors, Elevation } from "@blueprintjs/core";
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
import { useFeeVolumeFiatForPool } from "efi-ui/pools/useFeeVolumeForPool/useFeeVolumeForPool";
import { usePoolPairedToken } from "efi-ui/pools/usePoolPairedToken/usePoolPairedToken";
import { useTotalFiatLiquidityForPool } from "efi-ui/pools/useTotalFiatLiquidityForPool.ts/useTotalFiatLiquidityForPool";
import { useTrancheForPool } from "efi-ui/pools/useTrancheForPool/useTrancheForPool";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { useTermAssetSymbol } from "efi-ui/tranche/useTermAssetSymbol";
import { useTrancheCreatedAt } from "efi-ui/tranche/useTrancheCreatedAt";
import { formatMoney } from "efi/money/formatMoney";
import { PoolContract } from "efi/pools/PoolContract";

import styles from "./PrincipalPoolCard.module.css";
import { getTimeLeft } from "efi/base/time";

interface PrincipalPoolCardProps {
  pool: PoolContract | undefined;
}

const cellClassName = tw("flex", "mr-4", "items-center", "overflow-hidden");

const poolCardStyle: CSSProperties = { maxWidth: 1180, minWidth: 560 };
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
  const liquidity = useTotalFiatLiquidityForPool(pool);
  const trancheCreatedAt = useTrancheCreatedAt(tranche);
  const fees = useFeeVolumeFiatForPool(pool) ?? 0;
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

  // TODO: Get this from props
  const goToPoolPage = useCallback(() => {
    navigate(`pools/${pool?.address}`);
  }, [pool?.address]);

  const { isDarkMode } = useDarkMode();

  const dataToLoad = [
    tranche,
    liquidity,
    trancheCreatedAt,
    fees,
    baseAssetContract,
    baseAsset,
    baseAssetSymbol,
    BaseAssetIcon,
    termAssetContract,
    termAssetSymbol,
    unlockBN,
  ];
  const unlockTime = unlockBN?.toNumber();
  // TODO: this is a big hammer for loading state.  we should use a more granular technique when we can.
  const allDataLoaded = dataToLoad.every((data) => data !== undefined);

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

  const termLength = getTimeLeft(maturationDate);

  if (!allDataLoaded) {
    return (
      <Card
        elevation={Elevation.TWO}
        interactive
        onClick={goToPoolPage}
        style={poolCardStyle}
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
      style={poolCardStyle}
      className={classNames(
        styles.gridColsPoolCard,
        tw("grid", "grid-cols-12", "gap-y-4", "w-full", {
          transition: transitionsEnabled,
          "duration-1000": transitionsEnabled,
          "ease-in-out": transitionsEnabled,
        })
      )}
    >
      <div
        className={tw(
          cellClassName,
          "col-span-2",
          "sm:mr-0",
          "md:col-span-1",
          "xl:ml-4",
          "items-center"
        )}
      >
        {BaseAssetIcon ? (
          <div
            className={classNames(
              tw(
                "items-center",
                "justify-center",
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
          </div>
        ) : null}
      </div>
      <div
        className={tw(
          cellClassName,
          "col-span-3",
          "md:pl-2",
          "lg:pl-0",
          "lg:col-span-2"
        )}
      >
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
          label={t`tokens`}
        />
      </div>
      <div
        className={tw(
          cellClassName,
          "col-span-2",
          "md:col-span-2",
          "xl:col-span-1",
          "lg:col-span-2",
          "flex-grow"
        )}
      >
        <LabeledText large text={termLength} label={t`Term`} />
      </div>
      <div
        className={tw(
          cellClassName,
          "col-span-3",
          "md:col-span-3",
          "lg:col-span-3",
          "xl:col-span-2"
        )}
      >
        <LabeledText
          large
          text={formatMoney(liquidity, { wholeAmounts: true })}
          label={t`Pool Liquidity`}
        />
      </div>
      <div
        className={tw(
          cellClassName,
          "col-span-2",
          "md:col-span-1",
          "xl:col-span-1",
          "lg:col-span-2"
        )}
      >
        <LabeledText large text={"20%"} label={t`Fixed APY`} />
      </div>
      <div
        className={tw(
          cellClassName,
          "col-span-2",
          "col-start-3",
          "md:col-start-12",
          "lg:col-start-auto",
          "md:col-span-1",
          "xl:col-span-1",
          "lg:col-span-2"
        )}
      >
        <LabeledText large text={"10%"} label={t`Stake APY`} />
      </div>
      <div
        className={tw(
          cellClassName,
          "col-span-4",
          "md:col-start-5",
          "sm:col-span-4",
          "lg:col-start-5",
          "xl:col-span-3",
          "xl:col-start-auto"
        )}
      >
        <TimeLeft
          label={"Running, July 30, 2020"}
          startDate={startTime}
          maturityDate={maturityTime}
        />
      </div>
      <div
        className={tw(
          cellClassName,
          "col-span-2",
          "md:col-span-1",
          "flex",
          "flex-col",
          "overflow-visible"
        )}
      >
        <div className={tw("flex-1", "mb-2")}>
          <Button minimal outlined>
            {t`Trade`}
          </Button>
        </div>
        <div className={tw("flex-1")}>
          <Button minimal outlined>
            {t`Stake`}
          </Button>
        </div>
      </div>
    </Card>
  );
}
