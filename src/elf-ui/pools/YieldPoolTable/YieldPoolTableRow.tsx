import { ReactElement, useCallback } from "react";

import { Card, Classes, Elevation } from "@blueprintjs/core";
import { navigate } from "@reach/router";
import classNames from "classnames";
import { YieldPoolTokenInfo, YieldTokenInfo } from "tokenlists/types";
import { t } from "ttag";

import tw from "elf-tailwindcss-classnames";
import { LabeledText } from "elf-ui/base/LabeledText/LabeledText";
import { findAssetIcon } from "elf-ui/crypto/CryptoIcon";
import { GoToPoolButtonOld } from "elf-ui/pools/GoToPoolButton/GoToPoolButtonOld";
import styles from "elf-ui/pools/YieldPoolTable/grid.module.css";
import { useFeeVolumeForPool } from "elf-ui/pools/hooks/useFeeVolumeForPool/useFeeVolumeForPool";
import { useYearnVault } from "elf-ui/yearn/useYearnVault";
import { getYearnVaultAPY } from "elf-yearn/fetchYearnVaults";
import { formatPercent } from "elf/base/formatPercent";
import { ONE_WEEK_IN_SECONDS } from "elf/base/time";
import { getCryptoAssetForToken } from "elf/crypto/getCryptoAssetForToken";
import { getCryptoSymbol } from "elf/crypto/getCryptoSymbol";
import { formatMoney } from "elf/money/formatMoney";
import { getPoolTokens } from "elf/pools/getPoolTokens";
import { getPrincipalTokenInfoForPool } from "elf/pools/getPrincipalTokenInfoForPool";
import { yieldPoolContractsByAddress } from "elf/pools/weightedPool";
import { getVaultTokenInfoForTranche } from "elf/tranche/tranches";
import { getTokenInfo } from "elf/tokenlists";
import { formatYieldTokenShortSymbol } from "elf/interestToken/formatYieldTokenShortSymbol";
import { TimeLeft } from "elf-ui/base/TimeLeft/TimeLeft";
import { usePoolSpotPrice } from "elf-ui/pools/hooks/usePoolSpotPrice/usePoolSpotPrice";
import { PoolAction } from "elf-ui/pools/hooks/usePoolViewPoolActionsPref/usePoolViewPoolActionsPref";
import { useStakingAPY } from "elf-ui/pools/hooks/useStakingAPY";
import { useTotalFiatLiquidity } from "elf-ui/pools/hooks/useTotalFiatLiquidityForPool/useTotalFiatLiquidityForPool";
import { useDarkMode } from "elf-ui/prefs/useDarkMode/useDarkMode";

interface YieldPoolTableRowProps {
  yieldPoolInfo: YieldPoolTokenInfo;
}

export function YieldPoolTableRow(
  props: YieldPoolTableRowProps
): ReactElement | null {
  const {
    yieldPoolInfo,
    yieldPoolInfo: { address: poolAddress },
  } = props;
  const { isDarkMode } = useDarkMode();
  const poolContract = yieldPoolContractsByAddress[poolAddress];
  const principalTokenInfo = getPrincipalTokenInfoForPool(yieldPoolInfo);
  const {
    address: principalTokenAddress,
    extensions: { unlockTimestamp, createdAtTimestamp, interestToken },
  } = principalTokenInfo;
  const yieldTokenInfo = getTokenInfo<YieldTokenInfo>(interestToken);

  const liquidity = useTotalFiatLiquidity(yieldPoolInfo);
  const fees = useFeeVolumeForPool(yieldPoolInfo);
  const { baseAssetContract } = getPoolTokens(yieldPoolInfo);
  const baseAsset = getCryptoAssetForToken(baseAssetContract.address);
  const baseAssetSymbol = getCryptoSymbol(baseAsset);
  const BaseAssetIcon = findAssetIcon(baseAsset);
  const { symbol: vaultSymbol, address: vaultAddress } =
    getVaultTokenInfoForTranche(principalTokenAddress);
  const yieldTokenShortSymbol = formatYieldTokenShortSymbol(yieldTokenInfo);

  const stakingYield = useStakingAPY(yieldPoolInfo, ONE_WEEK_IN_SECONDS);

  const yieldPrice = usePoolSpotPrice(poolContract, yieldPoolInfo.address);
  const { data: vaultInfo } = useYearnVault(vaultSymbol, vaultAddress);
  const { apy } = vaultInfo || {};
  const vaultApy = apy ? getYearnVaultAPY(apy) : 0;

  const goToTrade = useCallback(() => {
    navigate(`/pools/${poolAddress}`);
  }, [poolAddress]);

  const dataToLoad = [liquidity, fees, stakingYield];
  // TODO: this is a big hammer for loading state.  we should use a more granular technique when we can.
  const allDataLoaded = dataToLoad.every(
    (data): data is typeof data => data !== undefined
  );

  if (!allDataLoaded) {
    return (
      <Card
        elevation={Elevation.TWO}
        interactive
        className={classNames(Classes.SKELETON, tw("h-24", "w-full"))}
      ></Card>
    );
  }

  return (
    <Card
      elevation={Elevation.TWO}
      interactive
      onClick={goToTrade}
      style={{ height: 128 }}
      className={classNames(tw("w-full"))}
    >
      <div className={classNames(tw("grid"), styles.yieldPoolGridColumns)}>
        {/* Logo */}
        <div>
          <LabeledText
            className={tw("text-left", "pl-4")}
            label={<br />}
            iconClassName={tw("flex-shrink-0")}
            icon={<BaseAssetIcon height={38} width={38} />}
            text={`${baseAssetSymbol} - ${yieldTokenShortSymbol}`}
          />
        </div>

        {/* Pool Liquidity */}
        <div>{formatMoney(liquidity, { wholeAmounts: true })}</div>

        {/* LP APY */}
        <div>{formatPercent(stakingYield)}</div>

        {/* Vault APY */}
        <div className={tw("flex", "justify-center", "font-bold")}>
          {formatPercent(vaultApy)}
        </div>

        {/* Yield Price */}
        <div>
          <LabeledText text={yieldPrice?.toFixed(4)} label={baseAssetSymbol} />
        </div>

        {/* Status */}
        <div>
          <TimeLeft
            isDarkMode={isDarkMode}
            startTimestamp={createdAtTimestamp * 1000}
            maturityTimestamp={unlockTimestamp * 1000}
          />
        </div>

        {/* Action Buttons */}
        <div>
          <GoToPoolButtonOld
            fill
            poolAddress={poolAddress}
            poolAction={PoolAction.BUY}
            label={t`Trade`}
          />
          <GoToPoolButtonOld
            fill
            poolAddress={poolAddress}
            poolAction={PoolAction.ADD_LIQUIDITY}
            label={t`LP`}
          />
        </div>
      </div>
    </Card>
  );
}
