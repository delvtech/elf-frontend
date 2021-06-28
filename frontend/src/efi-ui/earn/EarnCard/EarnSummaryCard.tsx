import React from "react";

import { Button, Card, Intent } from "@blueprintjs/core";
import { PrincipalPoolTokenInfo, YieldPoolTokenInfo } from "tokenlists/types";
import { Money } from "ts-money";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { TimeLeft } from "efi-ui/base/TimeLeft/TimeLeft";
import { useTotalFiatLiquidity } from "efi-ui/pools/useTotalFiatLiquidityForPool/useTotalFiatLiquidityForPool";
import { IconProps } from "efi-ui/token/TokenIcon";
import { formatPercent } from "efi/base/formatPercent";
import { formatMoney } from "efi/money/formatMoney";
import { PoolInfo } from "efi/pools/PoolInfo";

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
  baseAssetSymbol: string;
  yieldPrice: string | undefined;
  startTime: number;
  maturityTime: number;
  isExpanded: boolean;
}

const cellClassName = tw("flex", "mr-4", "items-center", "overflow-hidden");

export function EarnSummaryCard(props: EarnSummaryCardProps): JSX.Element {
  const {
    onToggleExpand,
    BaseAssetIcon,
    displayName,
    type,
    termLength,
    vaultApy,
    tvl,
    yieldPoolInfo,
    principalPoolInfo,
    yieldPrice,
    principalPrice,
    baseAssetSymbol,
    startTime,
    maturityTime,
    isExpanded,
  } = props;

  return (
    <Card onClick={onToggleExpand} className={tw("w-full", "flex", "p-5")}>
      <div
        className={tw(
          "w-full",
          "grid",
          "grid-cols-12",
          "gap-y-4",
          "w-full",
          "items-start"
        )}
      >
        <div
          className={tw(cellClassName, "col-span-1", "xl:ml-4", "items-center")}
        >
          <div className={tw("ml-2")}>
            <BaseAssetIcon height={40} width={40} />
          </div>
        </div>
        <div
          className={tw(
            cellClassName,
            "col-span-2",
            "lg:col-span-2",
            "xl:col-span-1"
          )}
        >
          <LabeledText
            text={t`Yearn ${displayName} ${type}`}
            label={t`Vault`}
          />
        </div>
        <div
          className={tw(
            cellClassName,
            "col-span-2",
            "md:col-span-2",
            "xl:col-span-1"
          )}
        >
          <LabeledText text={t`${termLength} Day`} label={t`Term`} />
        </div>
        <div
          className={tw(
            cellClassName,
            "col-span-2",
            "md:col-span-2",
            "xl:col-span-1"
          )}
        >
          <LabeledText
            text={t`${formatPercent(vaultApy)}`}
            label={`Vault APY`}
          />
        </div>
        <div
          className={tw(
            cellClassName,
            "col-span-3",
            "xl:col-span-2",
            "lg:col-span-2"
          )}
        >
          <LabeledText
            text={tvl ? formatMoney(tvl, { wholeAmounts: true }) : null}
            label={`Element TVL`}
          />
        </div>
        <div
          className={tw(
            cellClassName,
            "col-span-2",
            "lg:col-span-3",
            "xl:col-span-2"
          )}
        >
          <LiquiditySection
            yieldPoolInfo={yieldPoolInfo}
            principalPoolInfo={principalPoolInfo}
          />
        </div>
        <div
          className={tw(
            cellClassName,
            "col-span-2",
            "col-start-2",
            "lg:col-span-3",
            "lg:col-start-2",
            "xl:hidden"
          )}
        >
          <LiquiditySection
            yieldPoolInfo={yieldPoolInfo}
            principalPoolInfo={principalPoolInfo}
          />
        </div>
        <div
          className={tw(
            cellClassName,
            "col-span-2",
            "lg:col-start-6",
            "xl:col-start-auto",
            "xl:col-span-2"
          )}
        >
          <div className={tw("flex", "flex-col")}>
            <LabeledText
              text={t`${principalPrice}`}
              label={`Principal Price (${baseAssetSymbol})`}
            />
            <LabeledText
              className={tw("mt-2", "hidden", "xl:flex")}
              text={t`${yieldPrice}`}
              label={`Yield Price (${baseAssetSymbol})`}
            />
          </div>
        </div>
        <div className={tw(cellClassName, "col-span-2", "xl:hidden")}>
          <LabeledText
            text={t`${principalPrice}`}
            label={`Yield Price (${baseAssetSymbol})`}
          />
        </div>
        <div
          className={tw(
            cellClassName,
            "overflow-visible",
            "col-span-3",
            "lg:col-span-3",
            "xl:col-span-2"
          )}
        >
          <div className={tw("flex", "w-full", "items-start")}>
            <TimeLeft
              startTimestamp={startTime}
              maturityTimestamp={maturityTime}
            />
          </div>
        </div>
      </div>
      <div
        className={tw(
          "flex",
          "flex-col",
          "overflow-visible",
          "items-start",
          maturityTime && Date.now() < maturityTime ? "visible" : "invisible"
        )}
      >
        <Button
          intent={Intent.PRIMARY}
          minimal
          active={isExpanded}
          onClick={onToggleExpand}
        >
          {isExpanded ? t`Hide` : t`Show`}
        </Button>
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
    <div className={tw("flex", "flex-col")}>
      {liquidity && (
        <LabeledText
          text={formatMoney(liquidity, { wholeAmounts: true })}
          label={`Yield Pool Liquidity`}
        />
      )}
      {principalLiquidity && (
        <LabeledText
          className={tw("mt-2", "hidden", "xl:flex")}
          text={formatMoney(principalLiquidity, { wholeAmounts: true })}
          label={`Principal Pool Liquidity`}
        />
      )}
    </div>
  );
}
