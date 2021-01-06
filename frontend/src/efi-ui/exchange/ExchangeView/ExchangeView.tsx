import { Card, Classes, H2 } from "@blueprintjs/core";
import { RouteComponentProps } from "@reach/router";
import classNames from "classnames";
import React, { FC, useState } from "react";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { ButtonToggleFormGroup } from "efi-ui/base/ButtonToggleFormGroup/ButtonToggleFormGroup";
import { SearchFormGroup } from "efi-ui/base/SearchFormGroup/SearchFormGroup";
import { MarketsTable } from "efi-ui/markets/MarketsTable/MarketsTable";
import WalletSummaryPane from "efi-ui/wallets/WalletSummaryPane/WalletSummaryPane";
import { ElfStrategyHighRisk } from "efi/pools/highRisk";
import { ElfStrategyLowRisk } from "efi/pools/lowRisk";
import { ElfStrategyMediumRisk } from "efi/pools/mediumRisk";
import { Pool } from "efi/pools/Pool";
import { MarketFilterOptions } from "efi-ui/markets/MarketFilterOptions/MarketFilterOptions";

interface ExchangeViewProps extends RouteComponentProps {}

const ROI_BUTTONS = [
  { id: "all-apy", text: t`All` },
  { id: "low-apy", text: t`Low` },
  { id: "med-apy", text: t`Med` },
  { id: "high-apy", text: t`High` },
];

const POOL_BUTTONS = [
  { id: "all-pools", text: t`All` },
  { id: "eth-pools", text: t`ETH` },
  { id: "weth-pools", text: t`WETH` },
  { id: "usdc-pools", text: t`USDC` },
];

const ASSET_BUTTONS = [
  { id: "fixed-yield-tokens", text: t`FYT` },
  { id: "yield-coupons", text: t`YC` },
];

// TODO: change this to a list of Markets
const availableMarkets: Pool[] = [
  ElfStrategyLowRisk,
  ElfStrategyMediumRisk,
  ElfStrategyHighRisk,
];

export const ExchangeView: FC<ExchangeViewProps> = () => {
  const [selectedAsset, setSelectedAsset] = useState<string>(
    "fixed-yield-tokens"
  );
  const [selectedPool, setSelectedPool] = useState<string>("all-pools");
  const [selectedRisk, setSelectedRisk] = useState<string>("all-apy");
  const [searchValue, onSetSearchValue] = useState<string>("");

  return (
    <div
      className={tw("flex", "p-12", "h-full", "space-x-12", "overflow-scroll")}
    >
      {/* Main content */}
      <div className={tw("flex", "flex-col", "flex-1", "space-y-12")}>
        {/* page title */}
        <div className={tw("flex", "flex-col", "justify-start")}>
          <H2 className={tw("mb-4")}>{t`Element Exchange`}</H2>
          <span
            className={classNames(
              Classes.RUNNING_TEXT,
              Classes.TEXT_MUTED,
              tw("text-base")
            )}
          >{t`Invest in the latest Defi projects without the fees or hassle of managing everything yourself.`}</span>
        </div>

        <div className={tw("flex", "space-x-12")}>
          {/* Right hand side */}
          <div
            className={tw(
              "hidden",
              "lg:block",
              "h-full",
              "flex-shrink-0",
              "w-64"
            )}
          >
            <MarketFilterOptions />
          </div>
          <div className={tw("flex", "flex-1")}>
            <Card className={tw("p-10", "flex", "flex-1")}>
              <div className={tw("flex", "flex-col", "space-y-6")}>
                <div className={tw("flex", "justify-center")}>
                  <MarketsTable
                    className={tw("w-full")}
                    markets={availableMarkets}
                  />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
