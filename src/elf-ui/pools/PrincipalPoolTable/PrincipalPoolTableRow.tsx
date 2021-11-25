import { Fragment, ReactElement, useCallback } from "react";

import { Card, Classes, Elevation } from "@blueprintjs/core";
import { navigate } from "@reach/router";
import classNames from "classnames";
import { PrincipalPoolTokenInfo } from "tokenlists/types";
import { t } from "ttag";

import tw from "elf-tailwindcss-classnames";
import { LabeledText } from "elf-ui/base/LabeledText/LabeledText";
import { TimeLeft } from "elf-ui/base/TimeLeft/TimeLeft";
import { findAssetIcon } from "elf-ui/crypto/CryptoIcon";
import { GoToPoolButtonOld } from "elf-ui/pools/GoToPoolButton/GoToPoolButtonOld";
import { useFeeVolumeFiatForPool } from "elf-ui/pools/hooks/useFeeVolumeForPool/useFeeVolumeForPool";
import { usePoolSpotPrice } from "elf-ui/pools/hooks/usePoolSpotPrice/usePoolSpotPrice";
import { PoolAction } from "elf-ui/pools/hooks/usePoolViewPoolActionsPref/usePoolViewPoolActionsPref";
import { useStakingAPY } from "elf-ui/pools/hooks/useStakingAPY";
import { useTokenYield } from "elf-ui/pools/hooks/useTokenYield";
import { useTotalFiatLiquidity } from "elf-ui/pools/hooks/useTotalFiatLiquidityForPool/useTotalFiatLiquidityForPool";
import styles from "elf-ui/pools/PrincipalPoolTable/grid.module.css";
import { useDarkMode } from "elf-ui/prefs/useDarkMode/useDarkMode";
import { useYearnVault } from "elf-ui/yearn/useYearnVault";
import { getYearnVaultAPY } from "elf-yearn/fetchYearnVaults";
import { formatPercent } from "elf/base/formatPercent";
import { ONE_WEEK_IN_SECONDS } from "elf/base/time";
import { getCryptoAssetForToken } from "elf/crypto/getCryptoAssetForToken";
import { getCryptoSymbol } from "elf/crypto/getCryptoSymbol";
import { formatMoney } from "elf/money/formatMoney";
import { principalPoolContractsByAddress } from "elf/pools/ccpool";
import { getPrincipalTokenInfoForPool } from "elf/pools/getPrincipalTokenInfoForPool";
import { formatPrincipalTokenShortSymbol } from "elf/tranche/format";
import { getVaultTokenInfoForTranche } from "elf/tranche/tranches";

interface PrincipalPoolTableRowProps {
  className?: string;
  principalPoolTokenInfo: PrincipalPoolTokenInfo;
}
const cardStyle = { height: 128 };
export function PrincipalPoolTableRow(
  props: PrincipalPoolTableRowProps
): ReactElement {
  const {
    className,
    principalPoolTokenInfo,
    principalPoolTokenInfo: {
      address: poolAddress,
      extensions: { createdAtTimestamp, underlying },
    },
  } = props;

  const { isDarkMode } = useDarkMode();

  const goToTrade = useCallback(() => {
    navigate(`/pools/${poolAddress}`);
  }, [poolAddress]);

  // Base asset
  const baseAsset = getCryptoAssetForToken(underlying);
  const baseAssetSymbol = getCryptoSymbol(baseAsset);
  const BaseAssetIcon = findAssetIcon(baseAsset);

  // Principal Token
  const principalTokenInfo = getPrincipalTokenInfoForPool(
    principalPoolTokenInfo
  );
  const {
    address: principalTokenAddress,
    extensions: { unlockTimestamp },
  } = principalTokenInfo;
  const principalTokenShortSymbol =
    formatPrincipalTokenShortSymbol(principalTokenInfo);

  // Vault
  const { symbol: vaultSymbol, address: vaultAddress } =
    getVaultTokenInfoForTranche(principalTokenAddress);
  const { data: vaultInfo } = useYearnVault(vaultSymbol, vaultAddress);
  const { apy } = vaultInfo || {};
  const vaultApy = apy ? getYearnVaultAPY(apy) : 0;

  // Pool
  const liquidity = useTotalFiatLiquidity(principalPoolTokenInfo);
  const fees = useFeeVolumeFiatForPool(principalPoolTokenInfo);
  const poolContract = principalPoolContractsByAddress[poolAddress];
  const fixedYield = useTokenYield(principalPoolTokenInfo, "principal");
  const principalPrice =
    usePoolSpotPrice(poolContract, principalTokenAddress) ?? 0;
  const stakingYield = useStakingAPY(
    principalPoolTokenInfo,
    ONE_WEEK_IN_SECONDS
  );

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
      style={cardStyle}
      className={classNames(tw("w-full"), className)}
    >
      <div className={classNames(styles.principalPoolGridColumns)}>
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
        <div className={tw("flex", "justify-center", "font-bold")}>
          {formatPercent(vaultApy)}
        </div>

        {/* Principal Price */}
        <div>
          <LabeledText
            text={principalPrice?.toFixed(4)}
            label={baseAssetSymbol}
          />
        </div>

        {/* Term */}
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
