import React, {
  CSSProperties,
  ReactElement,
  useCallback,
  useEffect,
  useState,
} from "react";

import { Card, Classes, Elevation } from "@blueprintjs/core";
import { Link, navigate } from "@reach/router";
import classNames from "classnames";
import { differenceInDays } from "date-fns";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { TimeLeft } from "efi-ui/base/TimeLeft/TimeLeft";
import { findAssetIcon } from "efi-ui/crypto/CryptoIcon";
import { GoToPoolButton } from "efi-ui/pools/GoToPoolButton/GoToPoolButton";
import { useFeeVolumeFiatForPool } from "efi-ui/pools/useFeeVolumeForPool/useFeeVolumeForPool";
import { usePoolSpotPrice } from "efi-ui/pools/usePoolSpotPrice/usePoolSpotPrice";
import { PoolAction } from "efi-ui/pools/usePoolViewPoolActionsPref/usePoolViewPoolActionsPref";
import { useStakingAPY } from "efi-ui/pools/useStakingAPY";
import { useTokenYield } from "efi-ui/pools/useTokenYield";
import { useTotalFiatLiquidity } from "efi-ui/pools/useTotalFiatLiquidityForPool/useTotalFiatLiquidityForPool";
import { formatPercent } from "efi/base/formatPercent";
import { ONE_WEEK_IN_SECONDS } from "efi/base/time";
import { getCryptoAssetForToken } from "efi/crypto/getCryptoAssetForToken";
import { getCryptoSymbol2 } from "efi/crypto/getCryptoSymbol";
import { formatMoney } from "efi/money/formatMoney";
import { getPoolTokens } from "efi/pools/getPoolTokens";
import { getTrancheForPool } from "efi/pools/getTrancheForPool";
import { getTermAssetSymbol } from "efi/tranche/getTermAssetSymbol";
import { getVaultSymbol } from "efi/vaults/getVaultSymbol";
import { PrincipalPoolTokenInfo } from "tokenlists/types";
import { principalPoolContractsByAddress } from "efi/pools/ccpool";

interface PrincipalPoolCardProps {
  principalPoolInfo: PrincipalPoolTokenInfo;
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
  const {
    principalPoolInfo,
    principalPoolInfo: { address: poolAddress },
  } = props;

  const principalTokenInfo = getTrancheForPool(principalPoolInfo);
  const {
    extensions: {
      unlockTimestamp: unlockTime,
      createdAtTimestamp: trancheCreatedAt,
    },
  } = principalTokenInfo;

  const { baseAssetContract, termAssetContract } =
    getPoolTokens(principalPoolInfo);
  const baseAsset = getCryptoAssetForToken(baseAssetContract.address);
  const baseAssetSymbol = getCryptoSymbol2(baseAsset);
  const BaseAssetIcon = findAssetIcon(baseAsset);

  const vaultSymbol = getVaultSymbol(baseAsset);
  const { symbol: termAssetSymbol } = getTermAssetSymbol(
    termAssetContract?.address,
    vaultSymbol
  );

  const liquidity = useTotalFiatLiquidity(principalPoolInfo);
  const fees = useFeeVolumeFiatForPool(principalPoolInfo);
  const poolContract = principalPoolContractsByAddress[poolAddress];
  const fixedYield = useTokenYield(principalPoolInfo, "principal");
  const principalPrice =
    usePoolSpotPrice(poolContract, termAssetContract.address) ?? 0;
  const principalPriceFormatted = principalPrice?.toFixed(4);
  const stakingYield = useStakingAPY(principalPoolInfo, ONE_WEEK_IN_SECONDS);

  const goToTrade = useCallback(() => {
    navigate(`/pools/${poolAddress}`);
  }, [poolAddress]);

  const dataToLoad = [
    principalTokenInfo,
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
  const maturityTime = unlockTime * 1000;

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
          <div className={tw("ml-2")}>
            <BaseAssetIcon height={46} width={46} />
          </div>
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
                to={`/pools/${poolAddress}` || ""}
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
          <LabeledText text={formatPercent(stakingYield)} label={t`LP APY`} />
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
          poolAddress={poolAddress}
          poolAction={PoolAction.BUY}
          label={t`Trade`}
          outlined
          small
        />
        {maturityTime && maturityTime > Date.now() ? (
          <GoToPoolButton
            poolAddress={poolAddress}
            poolAction={PoolAction.ADD_LIQUIDITY}
            label={t`LP`}
            outlined
            small
          />
        ) : null}
      </div>
    </Card>
  );
}
