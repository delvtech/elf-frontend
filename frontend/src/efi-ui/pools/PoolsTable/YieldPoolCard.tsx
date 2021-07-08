import { ReactElement, useCallback } from "react";

import { Card, Classes, Elevation } from "@blueprintjs/core";
import { navigate } from "@reach/router";
import classNames from "classnames";
import { YieldPoolTokenInfo, YieldTokenInfo } from "tokenlists/types";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { TimeLeft } from "efi-ui/base/TimeLeft/TimeLeft";
import { findAssetIcon } from "efi-ui/crypto/CryptoIcon";
import { GoToPoolButton } from "efi-ui/pools/GoToPoolButton/GoToPoolButton";
import styles from "efi-ui/pools/PoolsTable/grid.module.css";
import { useFeeVolumeForPool } from "efi-ui/pools/useFeeVolumeForPool/useFeeVolumeForPool";
import { usePoolSpotPrice } from "efi-ui/pools/usePoolSpotPrice/usePoolSpotPrice";
import { PoolAction } from "efi-ui/pools/usePoolViewPoolActionsPref/usePoolViewPoolActionsPref";
import { useStakingAPY } from "efi-ui/pools/useStakingAPY";
import { useTotalFiatLiquidity } from "efi-ui/pools/useTotalFiatLiquidityForPool/useTotalFiatLiquidityForPool";
import { useYearnVault } from "efi-ui/yearn/useYearnVault";
import { getYearnVaultAPY } from "efi-yearn/fetchYearnVaults";
import { formatPercent } from "efi/base/formatPercent";
import { ONE_WEEK_IN_SECONDS } from "efi/base/time";
import { getCryptoAssetForToken } from "efi/crypto/getCryptoAssetForToken";
import { getCryptoSymbol } from "efi/crypto/getCryptoSymbol";
import { formatMoney } from "efi/money/formatMoney";
import { getPoolTokens } from "efi/pools/getPoolTokens";
import { getPrincipalTokenInfoForPool } from "efi/pools/getPrincipalTokenInfoForPool";
import { yieldPoolContractsByAddress } from "efi/pools/weightedPool";
import { getVaultTokenInfoForTranche } from "efi/tranche/tranches";
import { getTokenInfo } from "efi/tokenlists";
import { formatYieldTokenShortSymbol } from "efi/interestToken/formatYieldTokenShortSymbol";

interface YieldPoolCardProps {
  yieldPoolInfo: YieldPoolTokenInfo;
}

export function YieldPoolCard(props: YieldPoolCardProps): ReactElement | null {
  const {
    yieldPoolInfo,
    yieldPoolInfo: { address: poolAddress },
  } = props;
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
  const { symbol: vaultSymbol } = getVaultTokenInfoForTranche(
    principalTokenAddress
  );
  const yieldTokenShortSymbol = formatYieldTokenShortSymbol(yieldTokenInfo);

  const stakingYield = useStakingAPY(yieldPoolInfo, ONE_WEEK_IN_SECONDS);

  const yieldPrice = usePoolSpotPrice(
    poolContract,
    yieldPoolInfo.address
  )?.toFixed(4);
  const { data: vaultInfo } = useYearnVault(vaultSymbol);
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
      <div className={classNames(styles.yieldPoolGrid)}>
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
        <div>{t`${formatPercent(vaultApy)}`}</div>

        {/* Yield Price */}
        <div>
          <LabeledText text={yieldPrice} label={baseAssetSymbol} />
        </div>

        {/* Status */}
        <div>
          <TimeLeft
            startTimestamp={createdAtTimestamp * 1000}
            maturityTimestamp={unlockTimestamp * 1000}
          />
        </div>

        {/* Action Buttons */}
        <div>
          <GoToPoolButton
            fill
            poolAddress={poolAddress}
            poolAction={PoolAction.BUY}
            label={t`Trade`}
          />
          <GoToPoolButton
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
