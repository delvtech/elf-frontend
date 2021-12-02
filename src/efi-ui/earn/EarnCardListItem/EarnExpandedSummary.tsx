import React from "react";

import { PrincipalPoolTokenInfo, YieldPoolTokenInfo } from "tokenlists/types";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { useTokenYield } from "efi-ui/pools/hooks/useTokenYield";
import { useTotalFiatLiquidity } from "efi-ui/pools/hooks/useTotalFiatLiquidityForPool/useTotalFiatLiquidityForPool";
import { formatPercent } from "efi/base/formatPercent/formatPercent";
import { formatMoney } from "efi/money/formatMoney";
import { PoolInfo } from "efi/pools/PoolInfo";
import classNames from "classnames";
import { Classes } from "@blueprintjs/core";

interface EarnExpandedSummaryProps {
  yieldPoolInfo: YieldPoolTokenInfo;
  principalPoolInfo: PrincipalPoolTokenInfo;
  principalPrice: string | undefined;
  yieldPrice: string | undefined;
}

export function EarnExpandedSummary(
  props: EarnExpandedSummaryProps
): JSX.Element {
  const { yieldPoolInfo, principalPoolInfo, yieldPrice, principalPrice } =
    props;

  const fixedYield = useTokenYield(principalPoolInfo, "principal");

  return (
    <div className={tw("w-full", "space-y-2")}>
      <div className={tw("w-full", "flex", "justify-between")}>
        {/* Liquidity */}
        <div className={tw("flex", "flex-col", "space-y-2")}>
          <span className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}>
            {t`Pool liquidity:`}
          </span>
          <LiquiditySection
            yieldPoolInfo={yieldPoolInfo}
            principalPoolInfo={principalPoolInfo}
          />
        </div>
        {/* Price */}
        <div className={tw("flex", "flex-col", "space-y-2")}>
          <span className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}>
            {t`Token price:`}
          </span>
          <LabeledText text={t`${principalPrice}`} label={t`Principal token`} />
          <LabeledText text={t`${yieldPrice}`} label={t`Yield token`} />
        </div>

        {/* Fixed APR */}
        <div className={tw("flex", "flex-col", "space-y-2")}>
          <span className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}>
            {t`Fixed APR:`}
          </span>
          <div>{formatPercent(fixedYield)}</div>
        </div>
      </div>
    </div>
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
