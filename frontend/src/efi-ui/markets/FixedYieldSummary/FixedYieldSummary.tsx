import React, { FC } from "react";

import { Card, Classes } from "@blueprintjs/core";
import classNames from "classnames";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { TimeLeft } from "efi-ui/base/TimeLeft/TimeLeft";
import { TrendIndicator } from "efi-ui/base/TrendIndicator/TrendIndicator";
import { useYearnAPY } from "efi-ui/yearn/useYearnAPY";

interface FixedYieldSummaryProps {
  maturityDate: number | undefined;
  startDate: number | undefined;
}

// TODO: add loading states
export const FixedYieldSummary: FC<FixedYieldSummaryProps> = (props) => {
  const { maturityDate = 0, startDate = 0 } = props;
  const maturityDateString = new Date(maturityDate).toLocaleDateString();
  // hardcode for now, will make this dynamic after updating testnet
  const [apyInfo] = useYearnAPY("yWETH");
  console.log("apyInfo", apyInfo);

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
              <TrendIndicator value={0.0016} />
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
              <TrendIndicator value={0.0016} />
            </div>
          </div>
          <div className={tw("flex", "space-x-4", "justify-between")}>
            <div className={tw("flex", "flex-col")}>
              <span
                className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}
              >{t`Maturity date`}</span>
              <div className={classNames("h3", tw("space-x-4", "flex"))}>
                {maturityDateString}
              </div>
            </div>
            <div className={tw("flex", "self-end")}>
              <TimeLeft startDate={startDate} maturityDate={maturityDate} />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
