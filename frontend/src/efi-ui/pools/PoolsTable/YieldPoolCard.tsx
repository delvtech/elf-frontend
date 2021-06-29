import { ReactElement, useCallback } from "react";

import {
  ButtonGroup,
  Card,
  Classes,
  Elevation,
  Intent,
  Tag,
} from "@blueprintjs/core";
import { navigate } from "@reach/router";
import classNames from "classnames";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { findAssetIcon } from "efi-ui/crypto/CryptoIcon";
import { GoToPoolButton } from "efi-ui/pools/GoToPoolButton/GoToPoolButton";
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
import { getCryptoSymbol2 } from "efi/crypto/getCryptoSymbol";
import { formatMoney } from "efi/money/formatMoney";
import { getPoolTokens } from "efi/pools/getPoolTokens";
import { getTrancheForPool } from "efi/pools/getTrancheForPool";
import { getTermAssetSymbol } from "efi/tranche/getTermAssetSymbol";
import { getVaultSymbol } from "efi/vaults/getVaultSymbol";
import { YieldPoolTokenInfo } from "tokenlists/types";
import { yieldPoolContractsByAddress } from "efi/pools/weightedPool";
import { convertEpochSecondsToDate } from "efi/base/convertEpochSecondsToDate";
import { formatAbbreviatedDate } from "efi/base/dates";
import { getIsMature } from "efi/tranche/getIsMature";

interface YieldPoolCardProps {
  yieldPoolInfo: YieldPoolTokenInfo;
}

export function YieldPoolCard(props: YieldPoolCardProps): ReactElement | null {
  const {
    yieldPoolInfo,
    yieldPoolInfo: { address: poolAddress },
  } = props;
  const poolContract = yieldPoolContractsByAddress[poolAddress];
  const principalTokenInfo = getTrancheForPool(yieldPoolInfo);
  const {
    extensions: { unlockTimestamp },
  } = principalTokenInfo;
  const liquidity = useTotalFiatLiquidity(yieldPoolInfo);
  const fees = useFeeVolumeForPool(yieldPoolInfo);
  const { baseAssetContract, termAssetContract } = getPoolTokens(yieldPoolInfo);
  const baseAsset = getCryptoAssetForToken(baseAssetContract.address);
  const baseAssetSymbol = getCryptoSymbol2(baseAsset);
  const BaseAssetIcon = findAssetIcon(baseAsset);
  const vaultSymbol = getVaultSymbol(baseAsset);
  const { symbol: termAssetSymbol } = getTermAssetSymbol(
    termAssetContract?.address,
    vaultSymbol
  );

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
        className={classNames(
          Classes.SKELETON,
          tw("h-24", "w-full", "transition", "duration-1000", "ease-in-out")
        )}
      ></Card>
    );
  }

  const isRedeemable = getIsMature(unlockTimestamp);
  const unlockDate = convertEpochSecondsToDate(unlockTimestamp);
  const formattedUnlockDate = formatAbbreviatedDate(unlockDate);

  return (
    <Card
      elevation={Elevation.TWO}
      interactive
      onClick={goToTrade}
      className={classNames(tw("w-full"))}
    >
      <div
        className={tw(
          "w-full",
          "inline-grid",
          "gap-x-6",
          "grid-cols-8",
          "text-base"
        )}
      >
        {/* Logo */}
        <div className={tw("w-full", "col-span-2")}>
          <LabeledText
            className={tw("text-left", "pl-4")}
            label={t`Pool`}
            icon={<BaseAssetIcon height={38} width={38} />}
            text={`${baseAssetSymbol} - ${termAssetSymbol}`}
            textClassName={tw("text-base")}
          />
        </div>

        {/* Pool Liquidity */}
        <div>{formatMoney(liquidity, { wholeAmounts: true })}</div>

        {/* Vault APY */}
        <div>{t`${formatPercent(vaultApy)}`}</div>

        {/* LP APY */}
        <div>{formatPercent(stakingYield)}</div>

        {/* Yield Price */}
        <div>{`${yieldPrice} ${baseAssetSymbol}`}</div>

        {/* Term Length  */}
        <div>
          <Tag fill intent={isRedeemable ? Intent.SUCCESS : Intent.PRIMARY}>
            {formattedUnlockDate}
          </Tag>
        </div>

        {/* Action Buttons */}
        <ButtonGroup className={tw("p-0")}>
          <GoToPoolButton
            poolAddress={poolAddress}
            poolAction={PoolAction.BUY}
            label={t`Trade`}
          />
          <GoToPoolButton
            poolAddress={poolAddress}
            poolAction={PoolAction.ADD_LIQUIDITY}
            label={t`LP`}
          />
        </ButtonGroup>
      </div>
    </Card>
  );
}
