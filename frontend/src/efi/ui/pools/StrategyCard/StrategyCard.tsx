import React, { FC, useCallback, useState } from "react";

import { Card, H3, Intent, Tag } from "@blueprintjs/core";
import { BigNumber, ContractTransaction } from "ethers";
import { formatEther } from "ethers/lib/utils";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { CryptoSymbol } from "efi/crypto/CryptoSymbol";
import { Strategy } from "efi/pools/strategy";
import {
  AppToaster,
  makeErrorToast,
  makeSuccessToast,
} from "efi/ui/app/AppToaster/AppToaster";
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
import { useWalletBalance } from "efi/ui/wallets/hooks/useWalletBalance";

interface StrategyCardProps {
  strategy: Strategy<any>;
}

export const StrategyCard: FC<StrategyCardProps> = ({ strategy }) => {
  const { name, stakingAsset, apy } = strategy;
  const { data: walletBalance } = useWalletBalance();
  const { data: strategyCryptoSymbol } = useElfContractSymbol();
  const { data: elfTotalSupply } = useElfContractTotalSupply();
  const { data: elfBalance } = useElfContractBalance();
  const { data: strategyAssetSymbols } = useElfContractAssetSymbols();

  /****
   * Deposit hooks
   ****/
  const [, setAmountToDeposit] = useState<BigNumber | undefined>();

  const { depositEth } = useElfContractDepositEth();

  const [depositStarted, setDepositStarted] = useState(false);
  const [, setPendingTransaction] = useState<ContractTransaction>();

  const startDeposit = useCallback(
    async (amount: BigNumber) => {
      setDepositStarted(true);
      setAmountToDeposit(amount);
      try {
        const depositTransaction = await depositEth(amount);
        AppToaster.show({
          ...makeSuccessToast(t`View transaction on etherscan`),
          intent: Intent.PRIMARY,
          action: {
            href: `https://etherscan.io/tx/${depositTransaction?.hash}`,
            text: "View",
            intent: Intent.SUCCESS,
          },
        });
      } catch (error) {
        // if the user Rejects the transaction in their wallet
        setPendingTransaction(undefined);
        AppToaster.show({
          ...makeErrorToast(t`Transaction failed`),
          intent: Intent.PRIMARY,
        });
      }
      setDepositStarted(false);
    },
    [depositEth, setDepositStarted]
  );

  /****
   * Withdraw hooks
   ****/
  const [amountToWithdraw, setAmountToWithdraw] = useState<
    BigNumber | undefined
  >();
  const { withdrawEth } = useElfContractWithdrawEth(amountToWithdraw);
  const [withdrawStarted, setWithdrawStarted] = useState(false);
  const startWithdraw = useCallback(
    async (amount: BigNumber) => {
      setWithdrawStarted(true);
      setAmountToWithdraw(amount);
      try {
        const withdrawTransaction = await withdrawEth(amount);
        AppToaster.show({
          ...makeSuccessToast(t`View transaction on etherscan`),
          intent: Intent.PRIMARY,
          action: {
            href: `https://etherscan.io/tx/${withdrawTransaction?.hash}`,
            text: "View",
            intent: Intent.SUCCESS,
          },
        });
      } catch (error) {
        // if the user Rejects the transaction in their wallet
        setPendingTransaction(undefined);
        AppToaster.show({
          ...makeErrorToast(t`Transaction failed`),
          intent: Intent.PRIMARY,
        });
      }
      setWithdrawStarted(false);
    },
    [withdrawEth]
  );

  // const {
  //   value: confirmWithdraw,
  //   setTrue: showWithdrawConfirmation,
  //   setFalse: hideWithdrawConfirmation,
  // } = useBoolean(false);

  // const [amountToWithdraw, setAmountToWithdraw] = useState<
  //   BigNumber | undefined
  // >();

  // const startWithdraw = useCallback(
  //   (amount: BigNumber) => {
  //     setAmountToWithdraw(amount);
  //     showWithdrawConfirmation();
  //   },
  //   [showWithdrawConfirmation]
  // );

  // const onWithdrawComplete = useCallback(() => {
  //   setAmountToWithdraw(undefined);
  //   hideWithdrawConfirmation();
  // }, [hideWithdrawConfirmation]);

  // const onCancelWithdraw = useCallback(() => {
  //   setAmountToWithdraw(undefined);
  //   hideWithdrawConfirmation();
  // }, [hideWithdrawConfirmation]);

  const totalSupply = elfTotalSupply && formatEther(elfTotalSupply);

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

          {/* Held Assets Tags*/}
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
            <div className={tw("space-x-4")}>
              <span>{`${apy}%`}</span>
            </div>
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
          buttonIntent={depositStarted ? Intent.WARNING : Intent.PRIMARY}
          buttonEnabled={!depositStarted}
          buttonLabel={
            depositStarted
              ? t`Confirming deposit...`
              : t`Deposit ${stakingAsset}`
          }
          onTransaction={startDeposit}
        />

        {/* Withdraw */}
        <TransactionForm
          inputLabel={t`Withdraw`}
          cryptoSymbol={strategyCryptoSymbol as CryptoSymbol}
          cryptoBalance={elfBalance}
          buttonIntent={withdrawStarted ? Intent.WARNING : Intent.PRIMARY}
          buttonEnabled={!withdrawStarted}
          buttonLabel={
            withdrawStarted
              ? t`Confirming withdraw...`
              : t`Withdraw ${stakingAsset}`
          }
          onTransaction={startWithdraw}
        />
      </div>
    </Card>
  );
};
