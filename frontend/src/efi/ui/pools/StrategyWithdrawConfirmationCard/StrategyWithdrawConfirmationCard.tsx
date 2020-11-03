import React, { FC, useCallback, useEffect, useState } from "react";

import { Button, Card, H3, Intent, ProgressBar, Tag } from "@blueprintjs/core";
import { BigNumber, ContractTransaction } from "ethers";
import { formatEther } from "ethers/lib/utils";
import { jt, t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { NUM_CONFIRMATIONS_REQUIRED_FOR_TRANSACTION } from "efi/crypto/confirmations";
import { Strategy } from "efi/pools/strategy";
import { useBoolean } from "efi/ui/base/useBoolean/useBoolean";
import { useElfContractWithdrawEth } from "efi/ui/contracts/useElfContract";
import { ConfirmWithdrawButton } from "efi/ui/pools/StrategyWithdrawConfirmationCard/ConfirmWithdrawButton";
import { useWalletBalance } from "efi/ui/wallets/hooks/useWalletBalance";

interface StrategyWithdrawConfirmationCardProps {
  strategy: Strategy<any>;
  amountToWithdraw: BigNumber;
  onWithdrawComplete: () => void;
  onCancel: () => void;
}

export const StrategyWithdrawConfirmationCard: FC<StrategyWithdrawConfirmationCardProps> = ({
  strategy: { stakingAsset },
  amountToWithdraw,
  onWithdrawComplete,
  onCancel,
}) => {
  const { data: walletBalance } = useWalletBalance();
  const { withdrawEth, gasEstimate } = useElfContractWithdrawEth();
  const [currentTransaction, setCurrentTransaction] = useState<
    ContractTransaction
  >();
  const { data: gasEstimateInWei } = gasEstimate;
  const gasEstimateInEth = gasEstimateInWei
    ? formatEther(gasEstimateInWei)
    : undefined;

  const [confirmations, setConfirmations] = useState(0);
  const progress = confirmations / NUM_CONFIRMATIONS_REQUIRED_FOR_TRANSACTION;
  const transactionConfirmed = progress >= 1;

  // TODO: get this from ethers for actual transaction
  const { value: depositPending, setTrue: setWithdrawPending } = useBoolean(
    false
  );

  // TODO: add some checks here to make sure that the balance is greater than the amount depositing.
  //  Later we'll also pass the asset and determine which contract to call.
  const onWithdraw = useCallback(
    async (amount: BigNumber) => {
      setConfirmations(0);
      const transaction = await withdrawEth(amount);
      if (transaction) {
        setCurrentTransaction(transaction);
      }
      setWithdrawPending();

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
    [setWithdrawPending, withdrawEth]
  );

  // delay for 3 seconds so the user has a little bit to see the transaction completed
  useEffect(() => {
    if (transactionConfirmed) {
      setTimeout(() => {
        onWithdrawComplete();
      }, 3000);
    }
  }, [onWithdrawComplete, progress, transactionConfirmed]);

  const etherscan = (
    <a
      rel="noreferrer"
      target="_blank"
      href={`https://etherscan.io/tx/${currentTransaction?.hash}`}
    >
      etherscan.io
    </a>
  );

  const confirmationMessage = transactionConfirmed
    ? t`Transaction complete!`
    : t`Confirming transaction, ${confirmations} of ${NUM_CONFIRMATIONS_REQUIRED_FOR_TRANSACTION} blocks confirmed...`;

  return (
    <Card
      className={tw("flex", "flex-col", "w-full", "md:w-1/2", "transition-all")}
    >
      <div className={tw("flex", "flex-col", "mb-8", "items-center", "w-full")}>
        <H3>{t`Withdraw into Strategy`}</H3>

        <div className={tw("flex", "flex-col", "space-y-8", "w-full")}>
          {/* Staking Asset */}
          <div className={tw("flex", "flex-col", "items-start", "space-y-3")}>
            <span> {t`Amount to deposit`}</span>
            <div className={tw("space-x-4", "pl-2")}>
              <span>{formatEther(amountToWithdraw)}</span>
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

          <ConfirmWithdrawButton
            cryptoSymbol={stakingAsset}
            amountToWithdraw={amountToWithdraw}
            cryptoBalance={walletBalance}
            buttonLabel={t`Withdraw ${stakingAsset}`}
            withdrawPending={depositPending}
            onConfirmWithdraw={onWithdraw}
          />

          <Button
            minimal
            outlined
            large
            intent={Intent.DANGER}
            onClick={onCancel}
            disabled={depositPending}
          >
            {t`Cancel`}
          </Button>
        </div>
      </div>
    </Card>
  );
};
