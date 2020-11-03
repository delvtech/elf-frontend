import React, { FC, useCallback, useState } from "react";

import { Card, H3, Intent, Spinner, Tag } from "@blueprintjs/core";
import { BigNumber } from "ethers";
import { formatEther } from "ethers/lib/utils";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { CryptoSymbol } from "efi/crypto/CryptoSymbol";
import { Strategy } from "efi/pools/strategy";
import { useBoolean } from "efi/ui/base/useBoolean/useBoolean";
import { PieChart } from "efi/ui/charts/PieChart/PieChart";
import {
  useElfContractAssetSymbols,
  useElfContractBalance,
  useElfContractSymbol,
  useElfContractTotalSupply,
  useElfContractWithdrawEth,
} from "efi/ui/contracts/useElfContract";
import { TransactionForm } from "efi/ui/crypto/TransactionForm/TransactionForm";
import { StrategyDepositConfirmationCard } from "efi/ui/pools/StrategyDepositConfirmationCard/StrategyDepositConfirmationCard";
import { useWalletBalance } from "efi/ui/wallets/hooks/useWalletBalance";

interface StrategyCardProps {
  strategy: Strategy<any>;
}

export const StrategyCard: FC<StrategyCardProps> = ({ strategy }) => {
  const { name, stakingAsset } = strategy;
  const { data: walletBalance } = useWalletBalance();
  const { data: strategyCryptoSymbol } = useElfContractSymbol();
  const { data: elfTotalSupply } = useElfContractTotalSupply();
  const { data: elfBalance } = useElfContractBalance();
  const { data: strategyAssetSymbols } = useElfContractAssetSymbols();

  const [withdrawEth] = useElfContractWithdrawEth();

  const {
    value: confirmDeposit,
    setTrue: showDepositConfirmation,
    setFalse: hideDepositConfirmation,
  } = useBoolean(false);
  const [amountToDeposit, setAmountToDeposit] = useState<
    BigNumber | undefined
  >();

  const startDeposit = useCallback(
    (amount: BigNumber) => {
      setAmountToDeposit(amount);
      showDepositConfirmation();
    },
    [showDepositConfirmation]
  );

  // TODO: add some checks here to make sure that the balance is greater than the amount depositing.
  //  Later we'll also pass the asset and determine which contract to call.
  const onDepositComplete = useCallback(() => {
    setAmountToDeposit(undefined);
    hideDepositConfirmation();
  }, [hideDepositConfirmation]);

  const onCancelDeposit = useCallback(() => {
    setAmountToDeposit(undefined);
    hideDepositConfirmation();
  }, [hideDepositConfirmation]);

  const onWithdraw = useCallback(
    (amount: BigNumber) => {
      withdrawEth(amount);
    },
    [withdrawEth]
  );

  const totalSupply = elfTotalSupply && formatEther(elfTotalSupply);

  if (confirmDeposit && amountToDeposit) {
    return (
      <StrategyDepositConfirmationCard
        strategy={strategy}
        amountToDeposit={amountToDeposit}
        onDepositComplete={onDepositComplete}
        onCancel={onCancelDeposit}
      />
    );
  }

  return (
    <Card className={tw("flex", "flex-col", "md:w-1/2", "transition-all")}>
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

          {/*Held Assets Tags*/}
          <div className={tw("flex", "flex-col", "space-y-3")}>
            <span> {t`Assets in this strategy`}</span>
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

          {/* Expected APY */}
          <div className={tw("flex", "flex-col", "space-y-4")}>
            <span>{t`Exected APY`}</span>
            <Spinner
              className={tw("justify-start")}
              size={Spinner.SIZE_SMALL}
            />
          </div>

          {/* Total Supply*/}
          <div className={tw("flex", "flex-col", "space-y-4")}>
            <span>{t`Total Supply`}</span>
            <div className={tw("space-x-4")}>
              <span>{totalSupply}</span>
              <Tag minimal intent={Intent.PRIMARY} interactive large>
                {strategyCryptoSymbol}
              </Tag>
            </div>
          </div>
        </div>

        <div
          className={tw(
            "hidden",
            "xl:flex",
            "w-full",
            "h-full",
            "justify-center",
            "items-center",
            "p-5",
            "overflow-hidden" // required to make responsiveness work
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
          cryptoBalance={walletBalance}
          buttonLabel={t`Deposit ${stakingAsset}`}
          onTransaction={startDeposit}
        />

        {/* Withdraw */}
        <TransactionForm
          inputLabel={t`Withdraw`}
          cryptoSymbol={strategyCryptoSymbol as CryptoSymbol}
          cryptoBalance={elfBalance}
          buttonLabel={t`Withdraw ${stakingAsset}`}
          onTransaction={onWithdraw}
        />
      </div>
    </Card>
  );
};
