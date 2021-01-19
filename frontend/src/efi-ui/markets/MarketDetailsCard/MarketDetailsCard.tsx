import React, { FC, useState } from "react";
import { useInterval } from "react-use";

import { Button, Card, Classes, Intent, Tag } from "@blueprintjs/core";
import classNames from "classnames";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { LabeledProgressBar } from "efi-ui/base/LabeledProgressBar/LabeledProgressBar";
import BrushChart from "efi-ui/charts/BrushChart/BrushChart";
import { MarketActionsCard } from "efi-ui/markets/MarketActionsCard/MarketActionsCard";
import { getTimeLeft } from "efi/base/time";
import { Market } from "efi/markets/Market";
import { stubbedMarkets } from "efi/markets/stubbedMarkets";
import { ElfStrategyLowRisk } from "efi/pools/lowRisk";
import { Pool } from "efi/pools/Pool";

interface MarketDetailsCardProps {
  pool: Pool;
}

const timeData = [
  { timeMs: Date.parse("2021-01-12"), value: 1077.800674325 },
  { timeMs: Date.parse("2021-01-13"), value: 1156.5184414717 },
  { timeMs: Date.parse("2021-01-14"), value: 1238.2550033254 },
  { timeMs: Date.parse("2021-01-15"), value: 1183.2555122763 },
  { timeMs: Date.parse("2021-01-16"), value: 1184.195903343 },
  { timeMs: Date.parse("2021-01-17"), value: 1221.2200249181 },
  { timeMs: Date.parse("2021-01-18"), value: 1257.0474852058 },
];

export const MarketDetailsCard: FC<MarketDetailsCardProps> = ({ pool }) => {
  return (
    <div className={tw("flex", "mb-8", "space-x-4", "w-full", "items-stretch")}>
      <div className={tw("flex", "flex-1")}>
        <div className={tw("flex", "flex-col", "space-y-8", "w-full")}>
          <div className={tw("flex", "space-x-12")}>
            <MarketSummary />
            <FixedYieldSummary />
            <TokenSummary />
          </div>
          <div className={tw("flex", "space-x-12")}>
            <MarketHistory />
            <MarketActionsCard pool={ElfStrategyLowRisk} />
          </div>
        </div>
      </div>
    </div>
  );
};

const MarketSummary: FC<{}> = () => {
  return (
    <div className={tw("flex-1")}>
      <div className="mb-2">{t`Market Summary`}</div>
      <Card>
        <div className={tw("flex", "flex-col", "space-y-6")}>
          <div className={tw("flex", "space-x-4", "justify-between")}>
            <div className={tw("flex", "flex-col")}>
              <span
                className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}
              >{t`Total Liquidity`}</span>
              <div className={classNames("h3", tw("space-x-4"))}>
                $123,456,789
              </div>
            </div>
            <div className={tw("flex", "self-end")}>
              <Tag minimal intent={Intent.SUCCESS}>
                +.16%
              </Tag>
            </div>
          </div>
          {/* Volume (24hr)*/}
          <div className={tw("flex", "space-x-4", "justify-between")}>
            <div className={tw("flex", "flex-col")}>
              <span
                className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}
              >{t`Volume (24hr)`}</span>
              <div className={classNames("h3", tw("space-x-4"))}>
                $1,456,789
              </div>
            </div>
            <div className={tw("flex", "self-end")}>
              <Tag minimal intent={Intent.DANGER}>
                -.16%
              </Tag>
            </div>
          </div>
          {/* Fees (24hr)*/}
          <div className={tw("flex", "space-x-4", "justify-between")}>
            <div className={tw("flex", "flex-col")}>
              <span
                className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}
              >{t`Fees (24hr)`}</span>
              <div className={classNames("h3", tw("space-x-4"))}>$1,456</div>
            </div>
            <div className={tw("flex", "self-end")}>
              <Tag minimal intent={Intent.SUCCESS}>
                +.16%
              </Tag>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

const FixedYieldSummary: FC<{}> = () => {
  return (
    <div className={tw("flex-1")}>
      <div className="mb-2">{t`Yield Summary`}</div>
      <Card>
        <div className={tw("flex", "flex-col", "space-y-6")}>
          <div className={tw("flex", "space-x-4", "justify-between")}>
            <div className={tw("flex", "flex-col")}>
              <span
                className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}
              >{t`ROI (tranche)`}</span>
              <div className={classNames("h3", tw("space-x-4"))}>2.13%</div>
            </div>
            <div className={tw("flex", "self-end")}>
              <Tag minimal intent={Intent.SUCCESS}>
                +.16%
              </Tag>
            </div>
          </div>
          {/* Volume (24hr)*/}
          <div className={tw("flex", "space-x-4", "justify-between")}>
            <div className={tw("flex", "flex-col")}>
              <span
                className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}
              >{t`ROI (annual)`}</span>
              <div className={classNames("h3", tw("space-x-4"))}>10.27%</div>
            </div>
            <div className={tw("flex", "self-end")}>
              <Tag minimal intent={Intent.DANGER}>
                -.16%
              </Tag>
            </div>
          </div>
          <div className={tw("flex", "space-x-4", "justify-between")}>
            <div className={tw("flex", "flex-col")}>
              <span
                className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}
              >{t`Maturity date`}</span>
              <div className={classNames("h3", tw("space-x-4", "flex"))}>
                July 1st, 2020
              </div>
            </div>
            <div className={tw("flex", "self-end")}>
              <TimeLeft market={stubbedMarkets[0]} />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

const MarketHistory: FC<{}> = () => {
  return (
    <div className={tw("flex", "flex-1", "h-500")}>
      <div className={tw("flex", "flex-col", "w-full")}>
        <div className={tw("mb-2", "flex", "space-x-4")}>
          <a href="/">{t`Market Charts`}</a>
          <div>{t`Yield Charts`}</div>
        </div>
        <Card className={tw("flex", "flex-1", "relative")}>
          <div
            className={tw(
              "absolute",
              "w-full",
              "flex",
              "justify-between",
              "pr-10"
            )}
          >
            <div className={tw("flex", "space-x-4")}>
              <Button
                active
                minimal
                outlined
                intent={Intent.PRIMARY}
              >{t`Liquidity`}</Button>
              <Button
                minimal
                outlined
                intent={Intent.PRIMARY}
              >{t`Volume`}</Button>
            </div>
            <div className={tw("flex", "space-x-4")}>
              <Button
                active
                minimal
                outlined
                intent={Intent.PRIMARY}
              >{t`Week`}</Button>
              <Button
                minimal
                outlined
                intent={Intent.PRIMARY}
              >{t`Month`}</Button>
              <Button minimal outlined intent={Intent.PRIMARY}>{t`All`}</Button>
            </div>
          </div>
          <div className={tw("w-full", "h-full", "pt-4")}>
            <BrushChart
              data={timeData}
              getXValue={({ timeMs }) => timeMs}
              getYValue={({ value }) => value}
              compact
              isDarkMode
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

export const TimeLeft: FC<{ market: Market }> = ({ market }) => {
  const progress =
    (Date.now() - market.startDate) / (market.maturityDate - market.startDate);
  const [timerValue, setTimerValue] = useState(
    market.maturityDate - Date.now()
  );
  useInterval(() => {
    setTimerValue(market.maturityDate - Date.now());
  }, 1000);
  const [daysLeft, hoursLeft, minutesLeft] = getTimeLeft(timerValue);
  const time = t`${daysLeft} days, ${hoursLeft}, hours, ${minutesLeft} minutes`;

  return <LabeledProgressBar progressValue={progress} helperText={time} />;
};

const TokenSummary: FC<{}> = () => {
  return (
    <div className={tw("flex-1")}>
      <div className="mb-2">{t`Tokens`}</div>
      <div className={tw("flex", "flex-col", "space-x-4")}>
        <Card className={tw("flex", "space-x-4")}>
          <div className={tw("space-y-6", "flex-1")}>
            <div
              className={tw("flex", "flex-col", "justify-center", "space-y-1")}
            >
              <span className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}>
                {t`Token`}
              </span>
              <span className={tw("text-lg")}>{"Ether"}</span>
            </div>
            <div
              className={tw("flex", "flex-col", "justify-center", "space-y-1")}
            >
              <span className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}>
                {t`Price`}
              </span>
              <span className={tw("text-lg")}>{"$1,234"}</span>
            </div>
            <div
              className={tw("flex", "flex-col", "justify-center", "space-y-1")}
            >
              <span className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}>
                {t`Quantity`}
              </span>
              <div className={tw("flex", "content-center", "space-x-2")}>
                <span className={tw("text-lg")}>{"61,334"}</span>
                <Tag minimal intent={Intent.SUCCESS}>
                  +.16%
                </Tag>
              </div>
            </div>
          </div>
          <div className={tw("space-y-6", "flex-1")}>
            <div
              className={tw("flex", "flex-col", "justify-center", "space-y-1")}
            >
              <span className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}>
                {t`Token`}
              </span>
              <span className={tw("text-lg")}>{"fyEther"}</span>
            </div>
            <div
              className={tw("flex", "flex-col", "justify-center", "space-y-1")}
            >
              <span className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}>
                {t`Price`}
              </span>
              <span className={tw("text-lg")}>{"$1,234"}</span>
            </div>
            <div
              className={tw("flex", "flex-col", "justify-center", "space-y-1")}
            >
              <span className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}>
                {t`Quantity`}
              </span>
              <div className={tw("flex", "content-center", "space-x-2")}>
                <span className={tw("text-lg")}>{"61,334"}</span>
                <Tag minimal intent={Intent.SUCCESS}>
                  +.16%
                </Tag>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
