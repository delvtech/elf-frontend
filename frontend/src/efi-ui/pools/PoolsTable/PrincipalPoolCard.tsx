import React, {
  CSSProperties,
  ReactElement,
  useCallback,
  useEffect,
  useState,
} from "react";

import { Card, Classes, Colors, Elevation } from "@blueprintjs/core";
import { Link, navigate } from "@reach/router";
import classNames from "classnames";
import { differenceInDays } from "date-fns";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { TimeLeft } from "efi-ui/base/TimeLeft/TimeLeft";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { findAssetIcon2 } from "efi-ui/crypto/CryptoIcon";
import { useBaseAssetForPool } from "efi-ui/pools/useBaseAssetForPool/useBaseAssetForPool";
import { useFeeVolumeFiatForPool } from "efi-ui/pools/useFeeVolumeForPool/useFeeVolumeForPool";
import { usePoolPairedToken } from "efi-ui/pools/usePoolPairedToken/usePoolPairedToken";
import { usePoolSpotPrice } from "efi-ui/pools/usePoolSpotPrice/usePoolSpotPrice";
import { PoolAction } from "efi-ui/pools/usePoolViewPoolActionsPref/usePoolViewPoolActionsPref";
import { useStakingAPY } from "efi-ui/pools/useStakingAPY";
import { useTokenYield } from "efi-ui/pools/useTokenYield";
import { useTotalFiatLiquidityForPool } from "efi-ui/pools/useTotalFiatLiquidityForPool/useTotalFiatLiquidityForPool";
import { useTrancheForPool } from "efi-ui/pools/useTrancheForPool/useTrancheForPool";
import { GoToPoolButton } from "efi-ui/pools/GoToPoolButton/GoToPoolButton";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { useTrancheCreatedAt } from "efi-ui/tranche/useTrancheCreatedAt";
import { formatPercent } from "efi/base/formatPercent";
import { CryptoAssetType } from "efi/crypto/CryptoAsset";
import { getCryptoAssetForToken } from "efi/crypto/getCryptoAssetForToken";
import { getCryptoSymbol } from "efi/crypto/getCryptoSymbol";
import { formatMoney } from "efi/money/formatMoney";
import { PoolContract } from "efi/pools/PoolContract";
import { getTermAssetSymbol } from "efi/tranche/getTermAssetSymbol";
import { getVaultSymbol } from "efi/vaults/getVaultSymbol";

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
  const baseAsset = getCryptoAssetForToken(baseAssetContract?.address);
  const baseAssetSymbol = getCryptoSymbol(baseAsset);
  const BaseAssetIcon = findAssetIcon2(baseAsset);
  const termAssetContract = usePoolPairedToken(pool, baseAssetContract);

  const vaultSymbol = getVaultSymbol(baseAsset);
  const { symbol: termAssetSymbol } = getTermAssetSymbol(
    termAssetContract?.address,
    vaultSymbol
  );
  const { data: unlockBN } = useSmartContractReadCall(
    tranche,
    "unlockTimestamp"
  );
  const fixedYield = useTokenYield(baseAssetContract, pool, "principal");
  const principalPrice = usePoolSpotPrice(pool, termAssetContract);
  const principalPriceFormatted = principalPrice?.toFixed(4);

  const stakingYield = useStakingAPY(pool);

  const { isDarkMode } = useDarkMode();

  const goToTrade = useCallback(() => {
    navigate(`/pools/${pool?.address}`);
  }, [pool?.address]);

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

  const dayDifference = differenceInDays(
    maturityTime as number,
    startTime as number
  );

  const termLength =
    dayDifference > 10 ? Math.round(dayDifference / 10) * 10 : dayDifference;

  return (
    <Card
      elevation={Elevation.TWO}
      interactive
      onClick={goToTrade}
      style={poolCardStyle}
      className={classNames(
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
          <LabeledText text={t`${termLength} Day`} label={t`Term`} />
        </div>
        <div className={tw(cellClassName, "col-span-2")}>
          <LabeledText
            text={formatMoney(liquidity, { wholeAmounts: true })}
            label={t`Pool Liquidity`}
          />
        </div>
        <div className={tw(cellClassName, "col-span-2", "xl:col-span-1")}>
          <LabeledText text={formatPercent(fixedYield)} label={t`Fixed APY`} />
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
            text={t`${principalPriceFormatted}`}
            label={t`Price (${baseAssetSymbol})`}
          />
        </div>
        <div className={tw(cellClassName, "col-span-3", "xl:col-span-2")}>
          <div className={tw("flex", "w-full")}>
            <div className={tw("flex-1")}>
              <TimeLeft
                startTimestamp={startTime}
                maturityTimestamp={maturityTime}
              />
            </div>
          </div>
        </div>
      </div>
      <div
        className={tw(
          "flex",
          "flex-col",
          "space-y-2",
          "overflow-visible",
          "items-center",
          "justify-center",
          maturityTime && Date.now() < maturityTime ? "visible" : "invisible"
        )}
      >
        <GoToPoolButton
          poolAddress={pool.address}
          poolAction={PoolAction.BUY}
          label={t`Buy`}
          outlined
          small
        />
        {maturityTime && maturityTime > Date.now() ? (
          <GoToPoolButton
            poolAddress={pool.address}
            poolAction={PoolAction.ADD_LIQUIDITY}
            label={t`Stake`}
            outlined
            small
          />
        ) : null}
      </div>
    </Card>
  );
}
