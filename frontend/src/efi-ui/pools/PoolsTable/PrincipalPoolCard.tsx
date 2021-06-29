import { ReactElement, useCallback } from "react";

import { ButtonGroup, Card, Classes, Elevation } from "@blueprintjs/core";
import { navigate } from "@reach/router";
import classNames from "classnames";
import { PrincipalPoolTokenInfo } from "tokenlists/types";
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
import { convertEpochSecondsToDate } from "efi/base/convertEpochSecondsToDate";
import { formatAbbreviatedDate } from "efi/base/dates";
import { formatPercent } from "efi/base/formatPercent";
import { ONE_WEEK_IN_SECONDS } from "efi/base/time";
import { getCryptoAssetForToken } from "efi/crypto/getCryptoAssetForToken";
import { getCryptoSymbol2 } from "efi/crypto/getCryptoSymbol";
import { formatMoney } from "efi/money/formatMoney";
import { principalPoolContractsByAddress } from "efi/pools/ccpool";
import { getPoolTokens } from "efi/pools/getPoolTokens";
import { getTrancheForPool } from "efi/pools/getTrancheForPool";
import { formatTermLength } from "efi/tranche/formatTermLength/formatTermLength";
import { getTermAssetSymbol } from "efi/tranche/getTermAssetSymbol";
import { getVaultSymbol } from "efi/vaults/getVaultSymbol";

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

  const principalTokenInfo = getTrancheForPool(principalPoolInfo);
  const {
    extensions: { unlockTimestamp, createdAtTimestamp },
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

  const dataToLoad = [liquidity, fees, fixedYield, stakingYield];
  const allDataLoaded = dataToLoad.every((data) => data !== undefined);
  if (!allDataLoaded) {
    return (
      <Card
        elevation={Elevation.TWO}
        interactive
        className={classNames(Classes.SKELETON, tw("h-24", "w-full"))}
      ></Card>
    );
  }

  const unlockDate = convertEpochSecondsToDate(unlockTimestamp);
  const formattedUnlockDate = formatAbbreviatedDate(unlockDate);

  return (
    <Card
      elevation={Elevation.TWO}
      interactive
      onClick={goToTrade}
      className={classNames(tw("w-full", "h-24"))}
    >
      <div className={tw("w-full", "inline-grid", "gap-x-4", "grid-cols-10")}>
        {/* Logo */}
        <div className={tw("w-full", "col-span-2")}>
          <LabeledText
            iconClassName={tw("flex-shrink-0")}
            className={tw("text-left", "pl-4")}
            label={t`Pool`}
            icon={
              <div>
                <BaseAssetIcon height={38} width={38} />
              </div>
            }
            text={`${baseAssetSymbol} - ${termAssetSymbol}`}
          />
        </div>

        {/* Term */}
        <LabeledText
          containerItemsCenter={false}
          className={tw("text-left", "flex-shrink-0")}
          label={formattedUnlockDate}
          text={formatTermLength(
            createdAtTimestamp * 1000,
            unlockTimestamp * 1000
          )}
        />

        {/* Pool Liquidity */}
        <div>{formatMoney(liquidity, { wholeAmounts: true })}</div>

        {/* Fixed APY */}
        <div>{formatPercent(fixedYield)}</div>

        {/* LP APY */}
        <div>{formatPercent(stakingYield)}</div>

        {/* Principal Price */}
        <div>{`${principalPriceFormatted} ${baseAssetSymbol}`}</div>

        {/* Status */}
        <div className={tw("col-span-2")}>
          <TimeLeft
            showDate={false}
            startTimestamp={createdAtTimestamp * 1000}
            maturityTimestamp={unlockTimestamp * 1000}
          />
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
