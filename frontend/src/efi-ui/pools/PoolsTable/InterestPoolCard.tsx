import {
  CSSProperties,
  ReactElement,
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Button,
  Card,
  Classes,
  Colors,
  Elevation,
  Tag,
} from "@blueprintjs/core";
import { Link, navigate } from "@reach/router";
import classNames from "classnames";
import { differenceInDays, format } from "date-fns";
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
import { useYearnVault } from "efi-ui/yearn/useYearnVault";
import { formatMoney } from "efi/money/formatMoney";
import { PoolContract } from "efi/pools/PoolContract";

import styles from "./PrincipalPoolCard.module.css";
import { useTokenYield } from "efi-ui/pools/useTokenYield";
import { formatPercent } from "efi/base/formatPercent";
import { useStakingAPY } from "efi-ui/pools/useStakingAPY";
import { usePoolSpotPrice } from "efi-ui/pools/usePoolSpotPrice/usePoolSpotPrice";
import { useTokenPrice } from "efi-ui/token/hooks/useTokenPrice";
import { useCurrencyPref } from "efi-ui/prefs/useCurrency/useCurencyPref";

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
  const stakingYield = useStakingAPY(pool);
  const { currency } = useCurrencyPref();
  const [baseAssetPrice] = useTokenPrice(baseAssetContract, currency);
  const spotPrice = usePoolSpotPrice(pool, termAssetContract) ?? 0;
  // TODO: Get this from props
  const goToPoolPage = useCallback(() => {
    navigate(`pools/${pool?.address}`);
  }, [pool?.address]);

  const { data: vaultInfo } = useYearnVault(
    baseAssetSymbol ? t`yv${baseAssetSymbol}` : undefined
  );
  const { name, type } = vaultInfo || {};

  const { isDarkMode } = useDarkMode();

  // TODO: this is a big hammer for loading state.  we should use a more granular technique when we can.
  const dataToLoad = [
    tranche,
    liquidity,
    trancheCreatedAt,
    fees,
    baseAssetContract,
    baseAsset,
    baseAssetPrice,
    baseAssetSymbol,
    BaseAssetIcon,
    termAssetContract,
    termAssetSymbol,
    variableYield,
    stakingYield,
    spotPrice,
    unlockBN,
  ];
  // TODO: this is a big hammer for loading state.  we should use a more granular technique when we can.
  const allDataLoaded = dataToLoad.every(
    (data): data is typeof data => data !== undefined
  );

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

  const maturityDate = format(maturityTime, "MMM, d, yyyy");

  const yieldTokenPrice = baseAssetPrice?.multiply(spotPrice, Math.round);

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
          className={tw(
            cellClassName,
            "col-span-2",
            "sm:mr-0",
            "md:col-span-1",
            "xl:ml-4",
            "items-center"
          )}
        >
          {BaseAssetIcon && baseAssetSymbol === "ETH" ? (
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
                <BaseAssetIcon height={18} width={18} />
              </div>
            </div>
          ) : BaseAssetIcon ? (
            <div className={tw("ml-2")}>
              <BaseAssetIcon height={40} width={40} />
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
                to={`/pools/${pool?.address}` || ""}
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
          <LabeledText text={t`${name} ${type}`} label={t`Vault`} />
        </div>
        <div
          className={tw(
            cellClassName,
            "col-span-2",
            "md:col-span-2",
            "lg:col-span-1"
          )}
        >
          <LabeledText text={t`${termLength} Day`} label={t`Term`} />
        </div>
        <div
          className={tw(
            cellClassName,
            "col-span-2",
            "md:col-span-2",
            "lg:col-span-1"
          )}
        >
          <LabeledText text={"20%"} label={t`Vault APY`} />
        </div>
        <div className={tw(cellClassName, "col-span-3", "md:col-span-2")}>
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
            "md:col-start-2",
            "lg:col-start-auto",
            "md:col-span-2",
            "xl:col-span-1",
            "xl:-ml-12"
          )}
        >
          <LabeledText
            text={formatMoney(yieldTokenPrice, {
              wholeAmounts: (yieldTokenPrice?.toDecimal() ?? 0) > 10,
            })}
            label={t`Price`}
          />
        </div>
        <div
          className={tw(
            cellClassName,
            "col-span-2",
            "sm:col-start-auto",
            "md:col-span-2",
            "lg:-ml-8",
            "xl:ml-0",
            "lg:col-span-1",
            "xl:-ml-12"
          )}
        >
          <LabeledText
            text={formatPercent(stakingYield)}
            label={t`Stake APY`}
          />
        </div>
        <div
          className={tw(
            cellClassName,
            "overflow-visible",
            "-ml-8",
            "sm:ml-0",
            "col-span-4",
            "sm:col-span-3",
            "md:col-span-5",
            "lg:col-start-5",
            "lg:col-span-4",
            "xl:col-start-auto",
            "xl:col-span-2",
            "xl:-ml-12"
          )}
        >
          <div className={tw("flex", "w-full")}>
            <div>
              {startTime && maturityTime && Date.now() < maturityTime ? (
                <Tag intent="primary" className={tw("mr-4", "flex-grow-0")}>
                  Running
                </Tag>
              ) : (
                <Tag intent="success" className={tw("mr-4", "flex-grow-0")}>
                  Matured
                </Tag>
              )}
            </div>
            <div className={tw("flex-1", "-mt-2")}>
              <TimeLeft startDate={startTime} maturityDate={maturityTime} />
            </div>
          </div>
        </div>
      </div>
      <div
        className={tw("flex", "flex-col", "overflow-visible", "items-start")}
      >
        <div className={tw("mb-2")}>
          <Button minimal outlined intent={"primary"}>
            {t`Trade`}
          </Button>
        </div>
        <div>
          <Button minimal outlined intent={"primary"}>
            {t`Stake`}
          </Button>
        </div>
      </div>
    </Card>
  );
}
