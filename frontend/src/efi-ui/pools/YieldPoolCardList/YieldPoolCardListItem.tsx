import { Fragment, ReactElement, useCallback } from "react";

import {
  Card,
  Classes,
  Elevation,
  Intent,
  ProgressBar,
} from "@blueprintjs/core";
import { navigate } from "@reach/router";
import classNames from "classnames";
import {
  PrincipalTokenInfo,
  YieldPoolTokenInfo,
  YieldTokenInfo,
} from "tokenlists/types";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { findAssetIcon } from "efi-ui/crypto/CryptoIcon";
import { GoToPoolButton } from "efi-ui/pools/GoToPoolButton/GoToPoolButton";
import { useFeeVolumeFiatForPool } from "efi-ui/pools/hooks/useFeeVolumeForPool/useFeeVolumeForPool";
import { usePoolSpotPrice } from "efi-ui/pools/hooks/usePoolSpotPrice/usePoolSpotPrice";
import { PoolAction } from "efi-ui/pools/hooks/usePoolViewPoolActionsPref/usePoolViewPoolActionsPref";
import { useStakingAPY } from "efi-ui/pools/hooks/useStakingAPY";
import { useTotalFiatLiquidity } from "efi-ui/pools/hooks/useTotalFiatLiquidityForPool/useTotalFiatLiquidityForPool";
import { useYearnVault } from "efi-ui/yearn/useYearnVault";
import { getYearnVaultAPY } from "efi-yearn/fetchYearnVaults";
import { isYearnDaiVault } from "efi-yearn/hacks";
import { formatPercent } from "efi/base/formatPercent";
import { ONE_WEEK_IN_SECONDS } from "efi/base/time";
import { getCryptoAssetForToken } from "efi/crypto/getCryptoAssetForToken";
import { getCryptoSymbol } from "efi/crypto/getCryptoSymbol";
import { formatMoney } from "efi/money/formatMoney";
import { getVaultTokenInfoForTranche } from "efi/tranche/tranches";
import { TermTag } from "efi-ui/tranche/TermTag";
import { format } from "date-fns";
import { calculateProgress } from "efi/base/calculateProgress";
import { useNowMs } from "efi-ui/base/hooks/useNowMs/useNowMs";
import { getTokenInfo } from "efi/tokenlists";
import { formatYieldTokenShortSymbol } from "efi/interestToken/formatYieldTokenShortSymbol";
import { yieldPoolContractsByAddress } from "efi/pools/weightedPool";

interface YieldPoolCardListItemProps {
  yieldPoolTokenInfo: YieldPoolTokenInfo;
}
export function YieldPoolCardListItem(
  props: YieldPoolCardListItemProps
): ReactElement {
  const {
    yieldPoolTokenInfo,
    yieldPoolTokenInfo: {
      address: poolAddress,
      extensions: { underlying, interestToken: yieldTokenAddress },
    },
  } = props;

  const nowMs = useNowMs();
  const goToTrade = useCallback(() => {
    navigate(`/pools/${poolAddress}`);
  }, [poolAddress]);

  // Base asset
  const baseAsset = getCryptoAssetForToken(underlying);
  const baseAssetSymbol = getCryptoSymbol(baseAsset);
  const BaseAssetIcon = findAssetIcon(baseAsset);

  // Yield Token
  const yieldTokenInfo = getTokenInfo<YieldTokenInfo>(yieldTokenAddress);
  const {
    extensions: { unlockTimestamp, tranche: principalTokenAddress },
  } = yieldTokenInfo;
  const yieldTokenShortSymbol = formatYieldTokenShortSymbol(yieldTokenInfo);

  // Principal Token
  const {
    extensions: { createdAtTimestamp },
  } = getTokenInfo<PrincipalTokenInfo>(principalTokenAddress);

  // Vault
  const { symbol: vaultSymbol, address: vaultAddress } =
    getVaultTokenInfoForTranche(principalTokenAddress);
  const { data: vaultInfo } = useYearnVault(vaultSymbol, vaultAddress);
  const { apy } = vaultInfo || {};
  const vaultApy = apy ? getYearnVaultAPY(apy) : 0;

  // Pool
  const liquidity = useTotalFiatLiquidity(yieldPoolTokenInfo);
  const fees = useFeeVolumeFiatForPool(yieldPoolTokenInfo);
  const poolContract = yieldPoolContractsByAddress[poolAddress];
  const yieldTokenPrice =
    usePoolSpotPrice(poolContract, yieldTokenAddress) ?? 0;
  const stakingYield = useStakingAPY(yieldPoolTokenInfo, ONE_WEEK_IN_SECONDS);

  const dataToLoad = [liquidity, fees, stakingYield];
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
      className={classNames(
        tw("max-w-md", "w-full", "flex", "flex-col", "p-4", "space-y-2")
      )}
    >
      {/* Logo */}
      <div className={tw("flex", "w-full", "justify-between")}>
        <div className={tw("flex", "items-center", "space-x-2")}>
          <BaseAssetIcon height={38} width={38} />
          <span>{`${baseAssetSymbol} – ${yieldTokenShortSymbol}`}</span>
        </div>

        {/* Action Buttons */}
        <div className={tw("space-y-1")}>
          <GoToPoolButton
            fill
            small
            outlined
            poolAddress={poolAddress}
            poolAction={PoolAction.BUY}
            label={t`Trade`}
            className={tw("text-xs")}
          />
          <GoToPoolButton
            fill
            small
            outlined
            poolAddress={poolAddress}
            poolAction={PoolAction.ADD_LIQUIDITY}
            className={tw("text-xs")}
            label={t`LP`}
          />
        </div>
      </div>

      <div className={tw("flex", "w-full", "justify-between", "items-end")}>
        <div className={tw("flex", "flex-col", "space-y-2")}>
          {/* Pool Liquidity */}
          <span>{t`Liquidity: ${formatMoney(liquidity, {
            wholeAmounts: true,
          })}`}</span>
          <div className={tw("flex", "items-center", "space-x-2")}>
            <TermTag
              createdAtTimestamp={createdAtTimestamp}
              unlockTimestamp={unlockTimestamp}
            />
            <span>{format(createdAtTimestamp * 1000, "MMM d, y")}</span>
          </div>
        </div>

        <div className={tw("flex", "flex-col")}>
          {/* Yield Price */}
          <span
            className={tw("text-right")}
          >{t`Price: ${yieldTokenPrice?.toFixed(4)}`}</span>

          {/* Fixed APY */}
          <span className={tw("text-right")}>{t`LP APY: ${formatPercent(
            stakingYield
          )}`}</span>

          {/* Vault APY */}
          <span className={classNames(Classes.TEXT_MUTED, tw("text-right"))}>
            {t`Vault APY: ${
              isYearnDaiVault(vaultAddress)
                ? t`✨ NEW ✨`
                : formatPercent(vaultApy)
            }`}
          </span>
        </div>
      </div>

      {/* Term */}
      <div>
        <ProgressBar
          intent={
            nowMs > unlockTimestamp * 1000 ? Intent.SUCCESS : Intent.PRIMARY
          }
          animate={false}
          stripes={false}
          value={calculateProgress(
            createdAtTimestamp * 1000,
            unlockTimestamp * 1000
          )}
        />
      </div>
    </Card>
  );
}
