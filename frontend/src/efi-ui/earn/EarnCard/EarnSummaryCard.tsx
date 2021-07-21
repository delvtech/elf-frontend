import React from "react";

import { Button, Card, Intent } from "@blueprintjs/core";
import { PrincipalPoolTokenInfo, YieldPoolTokenInfo } from "tokenlists/types";
import { Money } from "ts-money";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import styles from "efi-ui/earn/grid.module.css";
import { useTotalFiatLiquidity } from "efi-ui/pools/useTotalFiatLiquidityForPool/useTotalFiatLiquidityForPool";
import { IconProps } from "efi-ui/token/TokenIcon";
import { formatPercent } from "efi/base/formatPercent";
import { formatMoney } from "efi/money/formatMoney";
import { PoolInfo } from "efi/pools/PoolInfo";
import { useTokenYield } from "efi-ui/pools/useTokenYield";
import { useStakingAPY } from "efi-ui/pools/useStakingAPY";
import { TimeLeft2 } from "efi-ui/tranche/TimeLeft2";
import { isYearnDaiVault } from "efi-yearn/hacks";
import { getVaultTokenInfoForTranche } from "efi/tranche/tranches";

interface EarnSummaryCardProps {
  onToggleExpand: () => void;
  BaseAssetIcon: React.FC<IconProps>;
  displayName: string | undefined;
  type: string | undefined;
  termLength: number;
  vaultApy: number;
  tvl: Money | undefined;
  yieldPoolInfo: YieldPoolTokenInfo;
  principalPoolInfo: PrincipalPoolTokenInfo;
  principalPrice: string | undefined;
  yieldPrice: string | undefined;
  startTime: number;
  maturityTime: number;
  isExpanded: boolean;
}

export function EarnSummaryCard(props: EarnSummaryCardProps): JSX.Element {
  const {
    onToggleExpand,
    BaseAssetIcon,
    displayName,
    type,
    vaultApy,
    tvl,
    yieldPoolInfo,
    principalPoolInfo,
    yieldPrice,
    principalPrice,
    startTime,
    maturityTime,
    isExpanded,
  } = props;

  const fixedYield = useTokenYield(principalPoolInfo, "principal");
  const ptStakingAPY = useStakingAPY(principalPoolInfo);
  const ytStakingAPY = useStakingAPY(yieldPoolInfo);

  const { address: vaultAddress } = getVaultTokenInfoForTranche(
    principalPoolInfo.extensions.bond
  );

  return (
    <Card onClick={onToggleExpand} className={tw("w-full", "flex", "p-5")}>
      <div className={styles.earnGrid}>
        {/* Vault */}
        <div>
          <LabeledText
            text={t`${displayName} ${type}`}
            iconClassName={tw("flex-shrink-0")}
            className={tw("text-left", "pl-4")}
            icon={<BaseAssetIcon height={38} width={38} />}
            label={t`Yearn Vault`}
          />
        </div>

        {/* Element TVL */}
        <div>{tvl ? formatMoney(tvl, { wholeAmounts: true }) : null}</div>

        {/* Vault APY */}
        <div className={tw("font-bold")}>
          {isYearnDaiVault(vaultAddress)
            ? t`✨ NEW ✨`
            : formatPercent(vaultApy)}
        </div>

        {/* LP APYs */}
        <div className={tw("flex", "flex-col", "space-y-3", "font-bold")}>
          <LabeledText
            text={formatPercent(ptStakingAPY)}
            label={t`Principal`}
          />
          <LabeledText text={formatPercent(ytStakingAPY)} label={t`Yield`} />
        </div>
        {/* Liquidity */}
        <div className={tw("flex", "flex-col")}>
          <LiquiditySection
            yieldPoolInfo={yieldPoolInfo}
            principalPoolInfo={principalPoolInfo}
          />
        </div>
        {/* Price */}
        <div className={tw("flex", "flex-col", "space-y-3")}>
          <LabeledText text={t`${principalPrice}`} label={t`Principal token`} />
          <LabeledText text={t`${yieldPrice}`} label={t`Yield token`} />
        </div>

        {/* Fixed APR */}
        <div>{formatPercent(fixedYield)}</div>

        {/* Term */}
        <div className={tw("flex", "w-full", "items-start")}>
          <TimeLeft2
            startTimestamp={startTime}
            maturityTimestamp={maturityTime}
          />
        </div>
        <div>
          <Button
            intent={Intent.PRIMARY}
            minimal
            large
            fill
            active={isExpanded}
            onClick={onToggleExpand}
          >
            {isExpanded ? t`Hide` : t`Show`}
          </Button>
        </div>
      </div>
    </Card>
  );
}

interface LiquiditySectionProps {
  yieldPoolInfo: PoolInfo;
  principalPoolInfo: PoolInfo;
}

function LiquiditySection({
  yieldPoolInfo,
  principalPoolInfo,
}: LiquiditySectionProps) {
  const liquidity = useTotalFiatLiquidity(yieldPoolInfo);
  const principalLiquidity = useTotalFiatLiquidity(principalPoolInfo);
  return (
    <div className={tw("flex", "flex-col", "space-y-3")}>
      {principalLiquidity && (
        <LabeledText
          text={formatMoney(principalLiquidity, { wholeAmounts: true })}
          label={`Principal Pool`}
        />
      )}
      {liquidity && (
        <LabeledText
          text={formatMoney(liquidity, { wholeAmounts: true })}
          label={`Yield Pool`}
        />
      )}
    </div>
  );
}
