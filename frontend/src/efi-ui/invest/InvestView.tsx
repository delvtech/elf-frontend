import React, { FC, useState } from "react";

import { Card, Classes, H2 } from "@blueprintjs/core";
import { RouteComponentProps } from "@reach/router";
import classNames from "classnames";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { ButtonToggleFormGroup } from "efi-ui/base/ButtonToggleFormGroup/ButtonToggleFormGroup";
import { SearchFormGroup } from "efi-ui/base/SearchFormGroup/SearchFormGroup";
import { PoolPreviewTable } from "efi-ui/pools/PoolPreviewTable/PoolPreviewTable";
import { PoolView } from "efi-ui/pools/PoolView/PoolView";
import { useWallet } from "efi-ui/wallets/hooks/useWallet";
import { MissingWalletEmptyState } from "efi-ui/wallets/MissingWalletEmptyState/MissingWalletEmptyState";
import WalletSummaryPane from "efi-ui/wallets/WalletSummaryPane/WalletSummaryPane";
import { ElfStrategyHighRisk } from "efi/pools/highRisk";
import { ElfStrategyLowRisk } from "efi/pools/lowRisk";
import { ElfStrategyMediumRisk } from "efi/pools/mediumRisk";

interface InvestViewProps extends RouteComponentProps {}

const APY_BUTTONS = [
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

const availableStrategies = [
  ElfStrategyLowRisk,
  ElfStrategyMediumRisk,
  ElfStrategyHighRisk,
];

export const InvestView: FC<InvestViewProps> = () => {
  const { account } = useWallet();
  const [selectedPool, setSelectedPool] = useState<string>("all-pools");
  const [selectedRisk, setSelectedRisk] = useState<string>("all-apy");
  const [searchValue, onSetSearchValue] = useState<string>("");

  const [selectedStrategy, setSelectedStrategy] = useState<string>();

  if (!account) {
    return <MissingWalletEmptyState />;
  }

  // TODO: Move to own route
  if (selectedStrategy) {
    return (
      <PoolView pool={selectedStrategy} setActivePool={setSelectedStrategy} />
    );
  }

  return (
    <div
      className={tw("flex", "p-12", "h-full", "space-x-12", "overflow-scroll")}
    >
      {/* Main content */}
      <div className={tw("flex", "flex-col", "flex-1", "space-y-16")}>
        {/* page title */}
        <div className={tw("flex", "flex-col", "justify-start")}>
          <H2 className={tw("mb-4")}>{t`Element Pools`} </H2>
          <span
            className={classNames(
              Classes.RUNNING_TEXT,
              Classes.TEXT_MUTED,
              tw("text-base")
            )}
          >{t`Invest in the latest Defi projects without the fees or hassle of managing everything yourself.`}</span>
        </div>

        <Card className={tw("p-10")}>
          <div className={tw("flex", "flex-col", "space-y-12")}>
            <div
              className={tw(
                "flex",
                "flex-1",
                "justify-between",
                "flex-col",
                "lg:flex-row",
                "space-y-4",
                "space-x-0",
                "lg:space-y-0",
                "lg:space-x-16"
              )}
            >
              <SearchFormGroup
                label={t`Search`}
                value={searchValue}
                onChange={onSetSearchValue}
              />

              <div className={tw("flex", "space-x-0", "lg:space-x-16")}>
                <ButtonToggleFormGroup
                  label={t`Select pool`}
                  tooltipContent={t`Pools are sorted by staking asset`}
                  selectedButtonId={selectedPool}
                  onSelect={setSelectedPool}
                  buttons={POOL_BUTTONS}
                />

                <ButtonToggleFormGroup
                  label={t`Select APY`}
                  tooltipContent={t`Risk is determined by the volatility of the underlying assets`}
                  selectedButtonId={selectedRisk}
                  onSelect={setSelectedRisk}
                  buttons={APY_BUTTONS}
                />
              </div>
            </div>

            {/* Strategy cards */}
            <div className={tw("flex", "justify-center")}>
              <PoolPreviewTable
                className={tw("w-full")}
                pools={availableStrategies}
                onSelectPool={setSelectedStrategy}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Right hand side */}
      <div className={tw("hidden", "lg:block", "h-full")}>
        <WalletSummaryPane />
      </div>
    </div>
  );
};
