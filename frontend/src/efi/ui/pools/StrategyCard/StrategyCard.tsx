import { Card, H3, Intent, Spinner, Tag } from "@blueprintjs/core";
import { Strategy } from "efi/pools/strategy";
import { PieChart } from "efi/ui/charts/PieChart/PieChart";
import {
  useElfContractDepositEth,
  useElfContractSymbol,
} from "efi/ui/contracts/useElfContract";
import { TransactionForm } from "efi/ui/crypto/TransactionForm/TransactionForm";
import { BigNumber } from "ethers";
import { parseEther } from "ethers/lib/utils";
import React, { FC, useCallback } from "react";
import tw from "tailwindcss-classnames";
import { t } from "ttag";

interface StrategyCardProps {
  strategy: Strategy<any>;
}

export const StrategyCard: FC<StrategyCardProps> = ({
  strategy: { name, heldAssets, stakingAsset },
}) => {
  const { data: strategyCryptoSymbol } = useElfContractSymbol();
  const [depositEth] = useElfContractDepositEth();

  // TODO: add some checks here to make sure that the balance is greater than the amount depositing.
  //  Later we'll also pass the asset and determine which contract to call.
  const onDeposit = useCallback(
    (amount: BigNumber) => {
      depositEth(amount);
    },
    [depositEth]
  );

  return (
    <Card className={tw("flex", "flex-col")}>
      <div className={tw("flex", "mb-8", "items-center", "w-full")}>
        <div className={tw("flex", "flex-col", "space-y-8")}>
          {/* Strategy name */}
          <H3>{name}</H3>

          {/* Staking Asset */}
          <div className={tw("flex", "flex-col", "space-y-3")}>
            <span> {t`Primary asset`}</span>
            <div>
              <Tag minimal intent={Intent.PRIMARY} interactive large>
                {stakingAsset}
              </Tag>
            </div>
          </div>

          {/* Strategy Token */}
          <div className={tw("flex", "flex-col", "space-y-3")}>
            <span> {t`Strategy token`}</span>
            <div>
              <Tag minimal intent={Intent.PRIMARY} interactive large>
                {strategyCryptoSymbol}
              </Tag>
            </div>
          </div>

          {/*Held Assets Tags*/}
          <div className={tw("flex", "flex-col", "space-y-3")}>
            <span> {t`Assets in this strategy`}</span>
            <div className={tw("flex", "space-x-4")}>
              {heldAssets.map((assetName) => {
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

          {/* Expected APY */}
          <div className={tw("flex", "flex-col", "space-y-4")}>
            <span>{t`Exected APY`}</span>
            <Spinner
              className={tw("justify-start")}
              size={Spinner.SIZE_SMALL}
            />
          </div>
        </div>

        <div
          className={tw(
            "hidden",
            "sm:flex",
            "w-full",
            "h-full",
            "justify-center",
            "items-center"
          )}
        >
          <PieChart />
        </div>
      </div>
      <div className={tw("flex", "justify-between", "w-full", "space-x-8")}>
        {/* Deposit */}
        <TransactionForm
          inputLabel={t`Deposit`}
          cryptoSymbol={stakingAsset}
          cryptoBalance={parseEther("3.00000")}
          buttonLabel={t`Deposit ${stakingAsset}`}
          onTransaction={onDeposit}
        />

        {/* Withdraw */}
        <TransactionForm
          inputLabel={t`Withdraw`}
          cryptoSymbol={stakingAsset}
          cryptoBalance={parseEther("12.21943")}
          buttonLabel={t`Withdraw ${stakingAsset}`}
          onTransaction={() => {}}
        />
      </div>
    </Card>
  );
};
