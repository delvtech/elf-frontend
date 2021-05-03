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
import { differenceInDays } from "date-fns";
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
import { useTotalFiatLiquidityForPool } from "efi-ui/pools/useTotalFiatLiquidityForPool.ts/useTotalFiatLiquidityForPool";
import { useTrancheForPool } from "efi-ui/pools/useTrancheForPool/useTrancheForPool";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { useTermAssetSymbol } from "efi-ui/tranche/useTermAssetSymbol";
import { useTrancheCreatedAt } from "efi-ui/tranche/useTrancheCreatedAt";
import { formatMoney } from "efi/money/formatMoney";
import { PoolContract } from "efi/pools/PoolContract";

import styles from "./PrincipalPoolCard.module.css";
import { useTokenYield } from "efi-ui/pools/useTokenYield";
import { formatPercent } from "efi/base/formatPercent";

interface InterestPoolCardProps {
  pool: PoolContract | undefined;
}

const cellClassName = tw("flex", "mr-4", "items-center", "overflow-hidden");

const poolCardStyle: CSSProperties = { maxWidth: 1180, minWidth: 560 };
// Stop propagation of clicks from the card title up to the card itself,
// otherwise you get double routed to /exchange/exchange/0xdeadbeef
const stopPropagationHandler = (e: React.MouseEvent<HTMLAnchorElement>) => {
  e.stopPropagation();
};

export function InterestPoolCard(
  props: InterestPoolCardProps
): ReactElement | null {
  const { pool } = props;
  const tranche = useTrancheForPool(pool);
  const liquidity = useTotalFiatLiquidityForPool(pool);
  const trancheCreatedAt = useTrancheCreatedAt(tranche);
  const fees = useFeeVolumeForPool(pool) ?? 0;
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

  const variableYield = useTokenYield(baseAssetContract, pool, "yield");
  // TODO: Get this from props
  const goToPoolPage = useCallback(() => {
    navigate(`pools/${pool?.address}`);
  }, [pool?.address]);

  const { isDarkMode } = useDarkMode();

  // TODO: this is a big hammer for loading state.  we should use a more granular technique when we can.
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
    variableYield,
    unlockBN,
  ];
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

  const startTime = trancheCreatedAt ? trancheCreatedAt * 1000 : 0;
  const maturityTime = unlockTime ? unlockTime * 1000 : 0;

  const termLength =
    Math.round(differenceInDays(maturityTime, startTime) / 10) * 10;

  return (
    <Card
      elevation={Elevation.TWO}
      interactive
      onClick={goToPoolPage}
      style={poolCardStyle}
      className={classNames(
        styles.gridColsPoolCard,
        tw("grid", "grid-cols-12", "gap-y-6", "w-full", {
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
                "p-1",
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
                "p-1",
                "rounded-full",
                "z-10",
                "bg-white",
                "border",
                "shadow-sm"
              )}
            >
              <BaseAssetIcon height={20} width={20} />
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
          "md:col-span-2",
          "lg:col-span-1"
        )}
      >
        <LabeledText
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
          "lg:col-span-2",
          "xl:col-span-1",
          "lg:col-span-1"
        )}
      >
        <LabeledText text={"Yearn ySTETH"} label={t`Vault`} />
      </div>
      <div
        className={tw(
          cellClassName,
          "col-span-2",
          "md:col-span-2",
          "xl:col-span-1"
        )}
      >
        <LabeledText text={t`${termLength} Day`} label={t`Term`} />
      </div>
      <div
        className={tw(
          cellClassName,
          "col-span-2",
          "md:col-span-2",
          "xl:col-span-1"
        )}
      >
        <LabeledText text={formatPercent(variableYield)} label={t`Vault APY`} />
      </div>
      <div
        className={tw(
          cellClassName,
          "col-span-3",
          "xl:col-span-2",
          "lg:col-span-2"
        )}
      >
        <LabeledText
          text={formatMoney(liquidity, { wholeAmounts: true })}
          label={t`Pool Liquidity`}
        />
      </div>
      <div
        className={tw(
          cellClassName,
          "col-span-2",
          "sm:col-start-auto",
          "md:col-start-3",
          "lg:col-start-auto",
          "md:col-span-2",
          "xl:col-span-1"
        )}
      >
        <LabeledText text={"$235.00"} label={t`Price`} />
      </div>
      <div
        className={tw(
          cellClassName,
          "col-span-2",
          "sm:col-start-auto",
          "lg:col-start-4",
          "md:col-span-2",
          "xl:col-span-1"
        )}
      >
        <LabeledText text={"10%"} label={t`Stake APY`} />
      </div>
      <div
        className={tw(
          cellClassName,
          "col-span-3",
          "sm:col-span-3",
          "xl:col-span-2"
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
