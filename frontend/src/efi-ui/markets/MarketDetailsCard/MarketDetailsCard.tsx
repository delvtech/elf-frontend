import React, { FC, useCallback, useState } from "react";
import { useInterval } from "react-use";

import { Button, Card, Intent, NonIdealState, Tag } from "@blueprintjs/core";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { useCryptoDrawer } from "efi-ui/crypto/CryptoDrawer/useCryptoDrawer/useCryptoDrawer";
import { useElfContractAssetSymbols } from "efi-ui/pools/hooks/useElfContract";
import {
  ONE_DAY_IN_MILLISECONDS,
  ONE_HOUR_IN_MILLISECONDS,
  ONE_MINUTE_IN_MILLISECONDS,
} from "efi/base/time";
import { Pool } from "efi/pools/Pool";
import { IconNames } from "@blueprintjs/icons";

interface MarketDetailsCardProps {
  pool: Pool;
}

const END_DATE = 1610760418863;

export const MarketDetailsCard: FC<MarketDetailsCardProps> = ({ pool }) => {
  const { data: strategyAssetSymbols } = useElfContractAssetSymbols();

  const { openCryptoDrawer } = useCryptoDrawer();
  const clickStakingAsset = useCallback(() => {
    openCryptoDrawer();
  }, [openCryptoDrawer]);

  const endDate = new Date(END_DATE);

  return (
    <Card className={tw("flex", "flex-col", "w-full", "transition-all")}>
      <div className={tw("flex", "mb-8", "space-x-8", "w-full")}>
        <div className={tw("flex", "flex-1")}>
          <div className={tw("flex", "flex-col", "space-y-8")}>
            {/* Staking Asset */}
            <div className={tw("flex", "flex-col", "space-y-3")}>
              <div>
                <b className={tw("text-xl")}>{t`Token Pair`}</b>{" "}
                <Tag
                  onClick={clickStakingAsset}
                  minimal
                  intent={Intent.PRIMARY}
                  interactive
                  large
                >
                  ETH
                </Tag>{" "}
                <Tag
                  onClick={clickStakingAsset}
                  minimal
                  intent={Intent.PRIMARY}
                  interactive
                  large
                >
                  ETH-FYT-2020-1-1
                </Tag>
              </div>
            </div>

            {/* Held Assets Tags*/}
            <div className={tw("flex", "flex-col", "space-y-3")}>
              <span> {t`Investment strategies for locked assets`}</span>
              <div className={tw("flex", "space-x-4")}>
                {strategyAssetSymbols?.map((assetName) => {
                  return (
                    <Tag
                      minimal
                      intent={Intent.PRIMARY}
                      interactive
                      large
                      key={assetName}
                    >
                      {assetName}
                    </Tag>
                  );
                })}
              </div>
            </div>

            {/* Total Liquidity*/}
            <div className={tw("flex", "space-x-4")}>
              <div className={tw("flex", "flex-col", "space-y-4")}>
                <span>{t`Total Liquidity`}</span>
                <div className={tw("space-x-4")}>$123,456,789</div>
              </div>
            </div>

            {/* Volume (24hr)*/}
            <div className={tw("flex", "space-x-4")}>
              <div className={tw("flex", "flex-col", "space-y-4")}>
                <span>{t`Volume (24hr)`}</span>
                <div className={tw("space-x-4")}>$1,456,789</div>
              </div>
            </div>
            {/* Fees (24hr)*/}
            <div className={tw("flex", "space-x-4")}>
              <div className={tw("flex", "flex-col", "space-y-4")}>
                <span>{t`Fees (24hr)`}</span>
                <div className={tw("space-x-4")}>$1,456</div>
              </div>
            </div>
          </div>
        </div>

        <div className={tw("flex", "flex-1")}>
          <div className={tw("flex", "flex-col", "space-y-8")}>
            <div className={tw("flex", "flex-col", "space-y-4")}>
              <span>{t`Maturation date for locked asset`}</span>
              <div className={tw("space-x-4")}>
                <Tag minimal intent={Intent.PRIMARY} interactive large>
                  {endDate.toLocaleDateString()}
                </Tag>
                <Tag minimal intent={Intent.PRIMARY} interactive large>
                  <Timer endTime={END_DATE} />
                </Tag>
              </div>
            </div>
            <Card className={tw("flex", "flex-1")}>
              <NonIdealState
                icon={IconNames.CHART}
                description={t`Graphs are under construction`}
                action={
                  <Button outlined disabled>{t`Graph coming soon`}</Button>
                }
              />
            </Card>
          </div>
        </div>
      </div>
    </Card>
  );
};

interface TimerProps {
  /**
   * end date in unix ms timestamp
   */
  endTime: number;
}
const Timer: FC<TimerProps> = (props) => {
  const { endTime } = props;
  const [timerValue, setTimerValue] = useState(endTime - Date.now());
  useInterval(() => {
    setTimerValue(endTime - Date.now());
  }, 1000);
  const days = Math.floor(timerValue / ONE_DAY_IN_MILLISECONDS);
  const hours = Math.floor(timerValue / ONE_HOUR_IN_MILLISECONDS);
  const minutes = Math.floor(timerValue / ONE_MINUTE_IN_MILLISECONDS);
  const seconds = Math.floor(timerValue / 1000);

  const hoursLeft = hours - days * 24;
  const minutesLeft = minutes - hours * 60;
  const secondsLeft = seconds - minutes * 60;
  return (
    <span>
      {t`${days} days, ${hoursLeft}, hours, ${minutesLeft} minutes, ${secondsLeft} seconds`}
    </span>
  );
};
