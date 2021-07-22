import { Fragment, ReactElement, useCallback } from "react";

import { Card, Classes, Elevation } from "@blueprintjs/core";
import { navigate } from "@reach/router";
import classNames from "classnames";
import { PrincipalPoolTokenInfo } from "tokenlists/types";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { findAssetIcon } from "efi-ui/crypto/CryptoIcon";
import { GoToPoolButton } from "efi-ui/pools/GoToPoolButton/GoToPoolButton";
import styles from "efi-ui/pools/PoolsTable/grid.module.css";
import { useFeeVolumeFiatForPool } from "efi-ui/pools/hooks/useFeeVolumeForPool/useFeeVolumeForPool";
import { useYearnVault } from "efi-ui/yearn/useYearnVault";
import { getYearnVaultAPY } from "efi-yearn/fetchYearnVaults";
import { formatPercent } from "efi/base/formatPercent";
import { ONE_WEEK_IN_SECONDS } from "efi/base/time";
import { getCryptoAssetForToken } from "efi/crypto/getCryptoAssetForToken";
import { getCryptoSymbol } from "efi/crypto/getCryptoSymbol";
import { formatMoney } from "efi/money/formatMoney";
import { principalPoolContractsByAddress } from "efi/pools/ccpool";
import { getPoolTokens } from "efi/pools/getPoolTokens";
import { getPrincipalTokenInfoForPool } from "efi/pools/getPrincipalTokenInfoForPool";
import { getVaultTokenInfoForTranche } from "efi/tranche/tranches";
import { formatPrincipalTokenShortSymbol } from "efi/tranche/format";
import { TimeLeft2 } from "efi-ui/tranche/TimeLeft2";
import { isYearnDaiVault } from "efi-yearn/hacks";
import { usePoolSpotPrice } from "efi-ui/pools/hooks/usePoolSpotPrice/usePoolSpotPrice";
import { PoolAction } from "efi-ui/pools/hooks/usePoolViewPoolActionsPref/usePoolViewPoolActionsPref";
import { useStakingAPY } from "efi-ui/pools/hooks/useStakingAPY";
import { useTokenYield } from "efi-ui/pools/hooks/useTokenYield";
import { useTotalFiatLiquidity } from "efi-ui/pools/hooks/useTotalFiatLiquidityForPool/useTotalFiatLiquidityForPool";

interface PrincipalPoolCardProps {
  principalPoolInfo: PrincipalPoolTokenInfo;
}

export function PrincipalPoolCard(
  props: PrincipalPoolCardProps
): ReactElement | null {
  const {
    principalPoolInfo,
    principalPoolInfo: { address: poolAddress },
  } = props;

  const principalTokenInfo = getPrincipalTokenInfoForPool(principalPoolInfo);
  const {
    address: principalTokenAddress,
    extensions: { unlockTimestamp, createdAtTimestamp },
  } = principalTokenInfo;

  const { baseAssetContract } = getPoolTokens(principalPoolInfo);
  const baseAsset = getCryptoAssetForToken(baseAssetContract.address);
  const baseAssetSymbol = getCryptoSymbol(baseAsset);
  const BaseAssetIcon = findAssetIcon(baseAsset);

  const { symbol: vaultSymbol, address: vaultAddress } =
    getVaultTokenInfoForTranche(principalTokenAddress);
  const principalTokenShortSymbol =
    formatPrincipalTokenShortSymbol(principalTokenInfo);

  const { data: vaultInfo } = useYearnVault(vaultSymbol, vaultAddress);
  const { apy } = vaultInfo || {};
  const vaultApy = apy ? getYearnVaultAPY(apy) : 0;

  const liquidity = useTotalFiatLiquidity(principalPoolInfo);
  const fees = useFeeVolumeFiatForPool(principalPoolInfo);
  const poolContract = principalPoolContractsByAddress[poolAddress];
  const fixedYield = useTokenYield(principalPoolInfo, "principal");
  const principalPrice =
    usePoolSpotPrice(poolContract, principalTokenInfo.address) ?? 0;
  const principalPriceFormatted = principalPrice?.toFixed(4);
  const stakingYield = useStakingAPY(principalPoolInfo, ONE_WEEK_IN_SECONDS);

  const goToTrade = useCallback(() => {
    navigate(`/pools/${poolAddress}`);
  }, [poolAddress]);

  const dataToLoad = [liquidity, fees, fixedYield, stakingYield];
  const allDataLoaded = dataToLoad.every((data) => data !== undefined);
  if (!allDataLoaded) {
    return (
      <Fragment>
        <Card
          elevation={Elevation.TWO}
          interactive
          className={classNames(Classes.SKELETON, tw("h-24", "w-full"))}
        ></Card>
      </Fragment>
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
      <div className={classNames(tw("grid"), styles.principalPoolGridColumns)}>
        {/* Logo */}
        <div>
          <LabeledText
            iconClassName={tw("flex-shrink-0")}
            className={tw("text-left", "pl-4")}
            label={<br />}
            icon={
              <div>
                <BaseAssetIcon height={38} width={38} />
              </div>
            }
            text={`${baseAssetSymbol} – ${principalTokenShortSymbol}`}
          />
        </div>

        {/* Pool Liquidity */}
        <div>{formatMoney(liquidity, { wholeAmounts: true })}</div>

        {/* Fixed APY */}
        <div className={tw("font-bold")}>{formatPercent(fixedYield)}</div>

        {/* LP APY */}
        <div>{formatPercent(stakingYield)}</div>

        {/* Vault APY */}
        <div>
          {isYearnDaiVault(vaultAddress)
            ? t`✨ NEW ✨`
            : formatPercent(vaultApy)}
        </div>

        {/* Principal Price */}
        <div>
          <LabeledText text={principalPriceFormatted} label={baseAssetSymbol} />
        </div>

        {/* Term */}
        <div>
          <TimeLeft2
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
