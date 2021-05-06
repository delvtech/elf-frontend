import {
  CSSProperties,
  ReactElement,
  useEffect,
  useState,
  useCallback,
} from "react";

import {
  Button,
  Card,
  Classes,
  Colors,
  Elevation,
  Intent,
  Tag,
} from "@blueprintjs/core";
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
import { CryptoAssetType } from "efi/crypto/CryptoAsset";
import { useCryptoSymbol } from "efi-ui/crypto/hooks/useCryptoSymbol/useCryptoSymbol";
import { useBaseAssetForPool } from "efi-ui/pools/useBaseAssetForPool/useBaseAssetForPool";
import { useFeeVolumeFiatForPool } from "efi-ui/pools/useFeeVolumeForPool/useFeeVolumeForPool";
import { usePoolPairedToken } from "efi-ui/pools/usePoolPairedToken/usePoolPairedToken";
import {
  usePoolViewPoolActionsTab,
  PoolAction,
} from "efi-ui/pools/usePoolViewPoolActionsPref/usePoolViewPoolActionsPref";
import { usePoolSpotPrice } from "efi-ui/pools/usePoolSpotPrice/usePoolSpotPrice";
import { useTokenYield } from "efi-ui/pools/useTokenYield";
import { useTotalFiatLiquidityForPool } from "efi-ui/pools/useTotalFiatLiquidityForPool.ts/useTotalFiatLiquidityForPool";
import { useTrancheForPool } from "efi-ui/pools/useTrancheForPool/useTrancheForPool";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { useTermAssetSymbol } from "efi-ui/tranche/useTermAssetSymbol";
import { useTrancheCreatedAt } from "efi-ui/tranche/useTrancheCreatedAt";
import { formatMoney } from "efi/money/formatMoney";
import { PoolContract } from "efi/pools/PoolContract";

import styles from "./PrincipalPoolCard.module.css";
import { formatPercent } from "efi/base/formatPercent";
import { useStakingAPY } from "efi-ui/pools/useStakingAPY";

interface PrincipalPoolCardProps {
  pool: PoolContract | undefined;
}

const cellClassName = tw("flex", "mr-4", "items-center");

const poolCardStyle: CSSProperties = { maxWidth: 1180, minWidth: 800 };
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
  const fixedYield = useTokenYield(baseAssetContract, pool, "principal");
  const principalPrice = usePoolSpotPrice(pool, termAssetContract)?.toFixed(4);

  const stakingYield = useStakingAPY(pool);

  const { isDarkMode } = useDarkMode();

  const { setTab } = usePoolViewPoolActionsTab();

  const goToTrade = useCallback(() => {
    setTab(PoolAction.SWAP);
    navigate(`pools/${pool?.address}`);
  }, [pool?.address, setTab]);

  const goToStake = useCallback(() => {
    setTab(PoolAction.STAKE);
    navigate(`pools/${pool?.address}`);
  }, [pool?.address, setTab]);

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
    fixedYield,
    stakingYield,
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

  if (!allDataLoaded) {
    return (
      <Card
        elevation={Elevation.TWO}
        interactive
        style={poolCardStyle}
        className={classNames(
          Classes.SKELETON,
          tw("h-24", "w-full", "transition", "duration-1000", "ease-in-out")
        )}
      ></Card>
    );
  }

  const startTime = trancheCreatedAt ? trancheCreatedAt * 1000 : undefined;
  const maturityTime = unlockTime ? unlockTime * 1000 : undefined;

  const termLength =
    Math.round(
      differenceInDays(maturityTime as number, startTime as number) / 10
    ) * 10;

  return (
    <Card
      elevation={Elevation.TWO}
      interactive
      style={poolCardStyle}
      className={classNames(
        styles.gridColsPoolCard,
        tw("w-full", "flex", {
          transition: transitionsEnabled,
          "duration-1000": transitionsEnabled,
          "ease-in-out": transitionsEnabled,
        })
      )}
    >
      <div
        className={tw(
          "flex-1",
          "w-full",
          "grid",
          "grid-cols-11",
          "gap-y-4",
          "w-full",
          "items-start"
        )}
      >
        <div
          className={tw(cellClassName, "col-span-1", "xl:ml-4", "items-start")}
        >
          {BaseAssetIcon && baseAsset?.type === CryptoAssetType.ETHEREUM ? (
            <div
              className={classNames(
                tw(
                  "items-start",
                  "justify-center",
                  "rounded",
                  "-mt-2",
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
                  "items-start",
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
          ) : BaseAssetIcon ? (
            <div className={tw("ml-2")}>
              <BaseAssetIcon height={46} width={46} />
            </div>
          ) : null}
        </div>
        <div
          className={tw(
            cellClassName,
            "col-span-2",
            "pl-2",
            "lg:pl-0",
            "lg:col-span-2"
          )}
        >
          <LabeledText
            large
            text={
              <Link
                className={tw("flex", "space-x-2")}
                to={`/pools/${pool?.address}` || ""}
                onClick={stopPropagationHandler}
              >
                {`${baseAssetSymbol} - ${termAssetSymbol}`}
              </Link>
            }
            label={t`Token Pool`}
          />
        </div>
        <div
          className={tw(
            cellClassName,
            "col-span-2",
            "lg:col-span-2",
            "xl:col-span-1",
            "flex-grow"
          )}
        >
          <LabeledText large text={t`${termLength} Day`} label={t`Term`} />
        </div>
        <div className={tw(cellClassName, "col-span-2")}>
          <LabeledText
            large
            text={formatMoney(liquidity, { wholeAmounts: true })}
            label={t`Pool Liquidity`}
          />
        </div>
        <div className={tw(cellClassName, "col-span-2", "xl:col-span-1")}>
          <LabeledText
            large
            text={formatPercent(fixedYield)}
            label={t`Fixed APY`}
          />
        </div>
        <div
          className={tw(
            cellClassName,
            "col-span-2",
            "xl:col-span-1",
            "lg:col-span-2"
          )}
        >
          <LabeledText
            large
            text={formatPercent(stakingYield)}
            label={t`Stake APY`}
          />
        </div>
        <div
          className={tw(
            cellClassName,
            "col-span-2",
            "col-start-4",
            "lg:col-start-4",
            "xl:col-start-auto",
            "xl:col-span-1"
          )}
        >
          <LabeledText
            large
            text={t`${principalPrice}`}
            label={t`Price (${baseAssetSymbol})`}
          />
        </div>
        <div className={tw(cellClassName, "col-span-3", "xl:col-span-2")}>
          <div className={tw("flex", "w-full")}>
            <div className={tw("flex-1")}>
              <TimeLeft startDate={startTime} maturityDate={maturityTime} />
            </div>
          </div>
        </div>
      </div>
      <div
        className={tw(
          "flex",
          "flex-col",
          "overflow-visible",
          "items-start",
          maturityTime && Date.now() < maturityTime ? "visible" : "invisible"
        )}
      >
        <div className={tw("mb-2")}>
          <Button minimal outlined intent={Intent.PRIMARY} onClick={goToTrade}>
            {t`Trade`}
          </Button>
        </div>
        <div
          className={maturityTime && maturityTime < Date.now() ? "hidden" : ""}
        >
          <Button minimal outlined intent={Intent.PRIMARY} onClick={goToStake}>
            {t`Stake`}
          </Button>
        </div>
      </div>
    </Card>
  );
}
