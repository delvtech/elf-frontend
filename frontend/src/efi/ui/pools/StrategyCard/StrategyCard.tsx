import React, { FC, useCallback, useState } from "react";

import { Button, Card, H3, Intent, Spinner, Tag } from "@blueprintjs/core";
import { BigNumber } from "ethers";
import { formatEther } from "ethers/lib/utils";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { Strategy } from "efi/pools/strategy";
import { useBoolean } from "efi/ui/base/useBoolean/useBoolean";
import { PieChart } from "efi/ui/charts/PieChart/PieChart";
import {
  useElfContractAssetSymbols,
  useElfContractBalance,
  useElfContractDepositEth,
  useElfContractSymbol,
  useElfContractTotalSupply,
  useElfContractWithdrawEth,
} from "efi/ui/contracts/useElfContract";
import { TransactionForm } from "efi/ui/crypto/TransactionForm/TransactionForm";
import { ConfirmDepositButton } from "efi/ui/pools/ConfrimDepositButton/ConfirmDepositButton";
import { useWalletBalance } from "efi/ui/wallets/hooks/useWalletBalance";

interface StrategyCardProps {
  strategy: Strategy<any>;
}

export const StrategyCard: FC<StrategyCardProps> = ({
  strategy: { name, stakingAsset },
}) => {
  const { data: walletBalance } = useWalletBalance();
  const { data: strategyCryptoSymbol } = useElfContractSymbol();
  const { data: elfTotalSupply } = useElfContractTotalSupply();
  const { data: elfBalance } = useElfContractBalance();
  const { data: strategyAssetSymbols } = useElfContractAssetSymbols();
  const [depositEth] = useElfContractDepositEth();
  const [withdrawEth] = useElfContractWithdrawEth();

  // TODO: get this from ethers for actual transaction
  const {
    value: depositPending,
    setTrue: setDepositPending,
    // setFalse: cancelDepositPending,
  } = useBoolean(false);

  const {
    value: showConfirmation,
    setTrue: setShowConfirmation,
    setFalse: hideConfirmation,
  } = useBoolean(false);
  const [amountToDeposit, setAmountToDeposit] = useState<
    BigNumber | undefined
  >();

  const showDepositConfirmation = useCallback(
    (amount: BigNumber) => {
      setShowConfirmation();
      setAmountToDeposit(amount);
    },
    [setShowConfirmation]
  );

  // TODO: add some checks here to make sure that the balance is greater than the amount depositing.
  //  Later we'll also pass the asset and determine which contract to call.
  const onDeposit = useCallback(
    (amount: BigNumber) => {
      depositEth(amount);
      setDepositPending();
    },
    [depositEth, setDepositPending]
  );

  const onCancelDeposit = useCallback(() => {
    setAmountToDeposit(undefined);
    hideConfirmation();
  }, [hideConfirmation]);

  const onWithdraw = useCallback(
    (amount: BigNumber) => {
      withdrawEth(amount);
    },
    [withdrawEth]
  );

  const totalSupply = elfTotalSupply && formatEther(elfTotalSupply);

  if (showConfirmation && amountToDeposit && walletBalance) {
    return (
      <Card className={tw("flex", "flex-col", "md:w-1/2", "transition-all")}>
        <div
          className={tw("flex", "flex-col", "mb-8", "items-center", "w-full")}
        >
          <H3>{t`Deposit into Stratgey`}</H3>

          <div className={tw("flex", "flex-col", "space-y-8", "w-full")}>
            {/* */}
            <div className={tw("flex", "flex-col", "items-start", "space-y-3")}>
              <span> {t`Amount to deposit`}</span>
              <div className={tw("space-x-4")}>
                <span>{formatEther(amountToDeposit)}</span>
                <Tag minimal intent={Intent.PRIMARY} interactive large>
                  {stakingAsset}
                </Tag>
              </div>
            </div>

            <ConfirmDepositButton
              cryptoSymbol={stakingAsset}
              amountToDeposit={amountToDeposit}
              cryptoBalance={walletBalance}
              buttonLabel={t`Deposit ${stakingAsset}`}
              depositPending={depositPending}
              onConfirmDeposit={onDeposit}
            />
            <Button
              minimal
              outlined
              large
              intent={Intent.DANGER}
              onClick={onCancelDeposit}
              loading={depositPending}
              disabled={depositPending}
            >
              {t`Cancel`}
            </Button>
          </div>
        </div>
      </Card>
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
                {stakingAsset}
              </Tag>
            </div>
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
          cryptoBalance={walletBalance}
          buttonLabel={t`Deposit ${stakingAsset}`}
          onTransaction={showDepositConfirmation}
        />

        {/* Withdraw */}
        <TransactionForm
          inputLabel={t`Withdraw`}
          cryptoSymbol={stakingAsset}
          cryptoBalance={elfBalance}
          buttonLabel={t`Withdraw ${stakingAsset}`}
          onTransaction={onWithdraw}
        />
      </div>
    </Card>
  );
};
