import React, { FC, useCallback, useEffect, useState } from "react";

import {
  Button,
  Card,
  H3,
  Intent,
  ProgressBar,
  Spinner,
  Tag,
} from "@blueprintjs/core";
import { BigNumber, ContractTransaction } from "ethers";
import { formatEther } from "ethers/lib/utils";
import { jt, t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { NUM_CONFIRMATIONS_REQUIRED_FOR_TRANSACTION } from "efi/crypto/confirmations";
import { CryptoSymbol } from "efi/crypto/CryptoSymbol";
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
  const { depositEth, gasEstimate } = useElfContractDepositEth();
  const [currentTransaction, setCurrentTransaction] = useState<
    ContractTransaction
  >();
  const { data: gasEstimateInWei } = gasEstimate;
  const gasEstimateInEth = gasEstimateInWei
    ? formatEther(gasEstimateInWei)
    : undefined;

  const [withdrawEth] = useElfContractWithdrawEth();

  const [confirmations, setConfirmations] = useState(0);
  const progress = confirmations / NUM_CONFIRMATIONS_REQUIRED_FOR_TRANSACTION;

  // TODO: get this from ethers for actual transaction
  const {
    value: depositPending,
    setTrue: setDepositPending,
    setFalse: cancelDepositPending,
  } = useBoolean(false);

  const {
    value: showConfirmation,
    setTrue: setShowConfirmation,
    setFalse: hideConfirmation,
  } = useBoolean(false);
  const [amountToDeposit, setAmountToDeposit] = useState<
    BigNumber | undefined
  >();
  useEffect(() => {
    if (progress === 1) {
      setTimeout(() => {
        cancelDepositPending();
        hideConfirmation();
        setConfirmations(0);
      }, 3000);
    }
  }, [cancelDepositPending, hideConfirmation, progress]);

  const showDepositConfirmation = useCallback(
    (amount: BigNumber) => {
      setShowConfirmation();
      setConfirmations(0);
      setAmountToDeposit(amount);
    },
    [setShowConfirmation]
  );

  // TODO: add some checks here to make sure that the balance is greater than the amount depositing.
  //  Later we'll also pass the asset and determine which contract to call.
  const onDeposit = useCallback(
    async (amount: BigNumber) => {
      const transaction = await depositEth(amount);
      if (transaction) {
        setCurrentTransaction(transaction);
      }
      setDepositPending();

      let clearId: number;

      // stubbing out some fake transactions for progress bar
      clearId = window.setInterval(() => {
        setConfirmations((prevConfirmations) => {
          if (
            prevConfirmations === NUM_CONFIRMATIONS_REQUIRED_FOR_TRANSACTION
          ) {
            clearInterval(clearId);
            return NUM_CONFIRMATIONS_REQUIRED_FOR_TRANSACTION;
          }
          return prevConfirmations + 1;
        });
      }, 1000);
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

  // TODO: add a real link to the transaction
  const etherscan = (
    <a
      rel="noreferrer"
      target="_blank"
      href={`https://etherscan.io/tx/${currentTransaction?.hash}`}
    >
      etherscan.io
    </a>
  );

  const confirmationMessage =
    progress === 1
      ? t`Transaction complete!`
      : t`Confirming transaction, ${confirmations} of ${NUM_CONFIRMATIONS_REQUIRED_FOR_TRANSACTION} blocks confirmed...`;

  if (showConfirmation && amountToDeposit && walletBalance) {
    return (
      <Card
        className={tw(
          "flex",
          "flex-col",
          "w-full",
          "md:w-1/2",
          "transition-all"
        )}
      >
        <div
          className={tw("flex", "flex-col", "mb-8", "items-center", "w-full")}
        >
          <H3>{t`Deposit into Strategy`}</H3>

          <div className={tw("flex", "flex-col", "space-y-8", "w-full")}>
            {/* Staking Asset */}
            <div className={tw("flex", "flex-col", "items-start", "space-y-3")}>
              <span> {t`Amount to deposit`}</span>
              <div className={tw("space-x-4", "pl-2")}>
                <span>{formatEther(amountToDeposit)}</span>
                <Tag minimal intent={Intent.PRIMARY} interactive large>
                  {stakingAsset}
                </Tag>
              </div>
            </div>

            {/* Gas Fee */}
            <div className={tw("flex", "flex-col", "items-start", "space-y-3")}>
              <span> {t`Gas estimate`}</span>
              <div className={tw("space-x-4", "pl-2")}>
                <span>{gasEstimateInEth}</span>
                <Tag minimal intent={Intent.PRIMARY} interactive large>
                  {stakingAsset}
                </Tag>
              </div>
            </div>

            {/* Gas Fee */}
            <div className={tw("flex", "flex-col", "items-start", "space-y-3")}>
              <span> {t`Transaction fee`}</span>
              <div className={tw("space-x-4", "pl-2")}>
                <span>{t`0 (no deposit fee)`}</span>
              </div>
            </div>

            {depositPending && (
              <div>
                <ProgressBar
                  intent={Intent.PRIMARY}
                  stripes={false}
                  value={progress}
                />
                <div className={tw("flex", "flex-col", "lg:flex-row")}>
                  <div className={tw("flex-1", "truncate")}>
                    {confirmationMessage}
                  </div>
                  {currentTransaction && (
                    <div
                      className={tw("flex-shrink-0")}
                    >{jt`View on ${etherscan}`}</div>
                  )}
                </div>
              </div>
            )}

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
          cryptoSymbol={strategyCryptoSymbol as CryptoSymbol}
          cryptoBalance={elfBalance}
          buttonLabel={t`Withdraw ${stakingAsset}`}
          onTransaction={onWithdraw}
        />
      </div>
    </Card>
  );
};
