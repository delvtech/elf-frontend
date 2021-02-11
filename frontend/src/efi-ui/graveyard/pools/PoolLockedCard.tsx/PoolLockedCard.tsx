import { Button, Card, Intent, Switch, Tag, Tooltip } from "@blueprintjs/core";
import { BigNumber } from "ethers";
import React, { FC, useCallback, useState } from "react";
import { QueryObserverResult } from "react-query";
import { useInterval } from "react-use";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { useCryptoDrawer } from "efi-ui/graveyard/CryptoDrawer/useCryptoDrawer/useCryptoDrawer";
import { TransactionForm } from "efi-ui/crypto/TransactionForm/TransactionForm";
import {
  useElfContractApproveDeposit,
  useElfContractAssetSymbols,
  useElfContractBalance,
  useElfContractDeposit,
  useElfContractDepositEth,
  useElfContractWithdraw,
  useElfContractWithdrawEth,
} from "efi-ui/graveyard/pools/hooks/useElfContract";
import { StakingAssetSelect } from "efi-ui/graveyard/pools/StakingAssetSelect/StakingAssetSelect";
import { useTokenAllowance } from "efi-ui/token/hooks/useTokenAllowance";
import { useTokenSymbol } from "efi-ui/token/hooks/useTokenSymbol";
import { useTokenTotalSupply } from "efi-ui/token/hooks/useTokenTotalSupply";
import { useWallet } from "efi-ui/graveyard/useWallet";
import { useWalletBalances } from "efi-ui/graveyard/useWalletBalance";
import {
  useWalletConnectionStatus,
  WalletConnectionStatus,
} from "efi-ui/wallets/hooks/useWalletConnectionStatus";
import {
  ONE_DAY_IN_MILLISECONDS,
  ONE_HOUR_IN_MILLISECONDS,
  ONE_MINUTE_IN_MILLISECONDS,
} from "efi/base/time";
import ContractAddresses from "efi/contracts/contractsJson";
import { elfContract } from "efi/contracts/Elf";
import { MAX_ALLOWANCE } from "efi/contracts/token";
import { CryptoSymbol } from "efi/crypto/CryptoSymbol";
import { formatEthBalance } from "efi/crypto/formatEthBalance";
import { StakingAssets } from "efi/crypto/stakingAssets";
import { TokenBalance } from "efi/crypto/TokenBalance";
import { TokenContractSymbols } from "efi/crypto/TokenContractSymbols";
import { Pool } from "efi/graveyard/pools/Pool";

interface PoolLockedCardProps {
  pool: Pool;
}

const END_DATE = 1610760418863;

export const PoolLockedCard: FC<PoolLockedCardProps> = ({ pool }) => {
  const { stakingAsset: defaultStakingAsset } = pool;
  const { accountAddress } = useWallet();
  const [balances] = useWalletBalances();
  const [walletStatus] = useWalletConnectionStatus();
  const [poolCryptoSymbol] = useTokenSymbol(elfContract);
  const [elfTotalSupply] = useTokenTotalSupply(elfContract);
  const elfBalance = useElfContractBalance(accountAddress);
  const { data: strategyAssetSymbols } = useElfContractAssetSymbols();
  const [stakingAsset, setStakingAsset] = useState<StakingAssets>(
    defaultStakingAsset
  );

  const [allowance, allowanceResult] = useAllowance(
    stakingAsset,
    accountAddress
  );
  const hasAllowance = allowance && allowance.gt(0);
  const allowanceLoading = allowanceResult.isLoading;

  const cryptoBalance = balances[stakingAsset];
  const walletConnected = walletStatus === WalletConnectionStatus.CONNECTED;

  /****
   * Approve hooks
   ****/
  const [startApproval, approvalPending] = useApprove(
    stakingAsset,
    accountAddress
  );
  const [clearApproval, clearApprovalPending] = useApprove(
    stakingAsset,
    accountAddress,
    BigNumber.from(0)
  );

  /****
   * Deposit hooks
   ****/
  const [startDeposit, depositPending] = useDeposit(
    stakingAsset,
    accountAddress
  );

  /****
   * Withdraw hooks
   ****/
  const [startWithdraw, withdrawPending] = useWithdraw(
    stakingAsset,
    accountAddress
  );

  const { openCryptoDrawer } = useCryptoDrawer();
  const clickStakingAsset = useCallback(() => {
    openCryptoDrawer();
  }, [openCryptoDrawer]);

  // TODO: refactor elfTotalSupply to be a TokenBalance
  const totalSupply =
    elfTotalSupply && formatEthBalance(elfTotalSupply.mul(157345));

  const endDate = new Date(END_DATE);

  return (
    <Card className={tw("flex", "flex-col", "w-full", "transition-all")}>
      <div className={tw("flex", "mb-8", "space-x-8", "w-full")}>
        <div className={tw("flex", "flex-1")}>
          <div className={tw("flex", "flex-col", "space-y-8")}>
            {/* Staking Asset */}
            <div className={tw("flex", "flex-col", "space-y-3")}>
              <div className={tw("flex", "space-x-1")}>
                <span>{t`Primary asset`}</span>
                <Tooltip
                  inheritDarkTheme={false}
                  content={t`You must provide this asset in order to take a position in this strategy.`}
                >
                  <sup>?</sup>
                </Tooltip>
              </div>
              <div>
                <Tag
                  onClick={clickStakingAsset}
                  minimal
                  intent={Intent.PRIMARY}
                  interactive
                  large
                >
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

            {/* Total Supply*/}
            <div className={tw("flex", "space-x-4")}>
              <div className={tw("flex", "flex-col", "space-y-4")}>
                <span>{t`Total fixed capital`}</span>
                <div className={tw("space-x-4")}>
                  <span>{totalSupply}</span>
                  <Tag minimal intent={Intent.PRIMARY} interactive large>
                    {poolCryptoSymbol?.[0]}
                  </Tag>
                </div>
              </div>
              <div className={tw("flex", "flex-col", "space-y-4")}>
                <span>{t`Total interest`}</span>
                <div className={tw("space-x-4")}>
                  <span>134,556.984</span>
                  <Tag minimal intent={Intent.PRIMARY} interactive large>
                    {poolCryptoSymbol?.[0]}
                  </Tag>
                </div>
              </div>
            </div>
            {/* Total Supply*/}
            <div className={tw("flex", "space-x-4")}>
              <div className={tw("flex", "flex-col", "space-y-4")}>
                <span>{t`Your fixed capital`}</span>
                <div className={tw("space-x-4")}>
                  <span>100</span>
                  <Tag minimal intent={Intent.PRIMARY} interactive large>
                    {poolCryptoSymbol?.[0]} FYT
                  </Tag>
                </div>
              </div>
              <div className={tw("flex", "flex-col", "space-y-4")}>
                <span>{t`Your interest`}</span>
                <div className={tw("space-x-4")}>
                  <span>5.98</span>
                  <Tag minimal intent={Intent.PRIMARY} interactive large>
                    {poolCryptoSymbol?.[0]} IC
                  </Tag>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={tw("flex", "flex-1")}>
          <div className={tw("flex", "flex-col", "space-y-8")}>
            <div className={tw("flex", "flex-col", "space-y-4")}>
              <span>{t`Maturation date`}</span>
              <div className={tw("space-x-4")}>
                <Tag minimal intent={Intent.PRIMARY} interactive large>
                  {endDate.toLocaleDateString()}
                </Tag>
              </div>
            </div>
            <div className={tw("flex", "flex-col", "space-y-4")}>
              <span>{t`Time until maturation`}</span>
              <div className={tw("space-x-4")}>
                <Tag minimal intent={Intent.PRIMARY} interactive large>
                  <Timer endTime={END_DATE} />
                </Tag>
              </div>
            </div>
            <div className={tw("flex", "flex-col", "space-y-4")}>
              <span>{t`Enable automatic rollover`}</span>
              <div className={tw("flex", "space-x-4")}>
                <Switch
                  large
                  innerLabel={t`off`}
                  innerLabelChecked={t`on`}
                  className={tw("mb-0")}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={tw("flex", "w-full", "space-x-8", "pt-4")}>
        <div className={tw("flex", "flex-1", "justify-between")}>
          <StakingAssetSelect
            selectedAsset={stakingAsset}
            onSelect={setStakingAsset}
          />
          <Button
            minimal
            outlined
            disabled={approvalPending || allowanceLoading || hasAllowance}
            onClick={startApproval}
            intent={Intent.SUCCESS}
            text={hasAllowance ? t`Approved` : t`Approve Deposit`}
          />
          {hasAllowance && (
            <Button
              minimal
              outlined
              disabled={clearApprovalPending || !hasAllowance}
              onClick={clearApproval}
              intent={Intent.DANGER}
              text={t`Clear Approval`}
            />
          )}
        </div>
        <div className={tw("flex-1")}>
          <StakingAssetSelect
            selectedAsset={stakingAsset}
            onSelect={setStakingAsset}
          />
        </div>
      </div>
      <div
        className={tw("flex", "justify-between", "w-full", "space-x-8", "pt-4")}
      >
        <div className={tw("flex-1")}>
          {/* Deposit */}
          <TransactionForm
            inputLabel={t`Deposit`}
            formDisabled={!walletConnected || depositPending}
            cryptoSymbol={stakingAsset}
            cryptoBalance={cryptoBalance as TokenBalance}
            buttonIntent={depositPending ? Intent.WARNING : Intent.PRIMARY}
            buttonLabel={
              depositPending
                ? t`Confirming deposit...`
                : t`Deposit ${stakingAsset}`
            }
            onTransaction={startDeposit}
          />
        </div>

        <div className={tw("flex-1")}>
          {/* Withdraw */}
          <TransactionForm
            inputLabel={t`Claim assets (available after pool rolls over)`}
            cryptoSymbol={poolCryptoSymbol?.[0] as CryptoSymbol}
            cryptoBalance={elfBalance}
            buttonIntent={withdrawPending ? Intent.WARNING : Intent.PRIMARY}
            formDisabled={true}
            buttonLabel={
              withdrawPending
                ? t`Confirming withdraw...`
                : t`Withdraw ${stakingAsset}`
            }
            onTransaction={startWithdraw}
          />
        </div>
      </div>
    </Card>
  );
};

/**
 * helper hook to handle the deposit approval process
 * @param stakingAsset
 * @param account
 */
function useAllowance(
  stakingAsset: StakingAssets,
  account: string | null | undefined
): [BigNumber | undefined, QueryObserverResult<BigNumber | undefined>] {
  // Eth is not a token
  const tokenSymbol: TokenContractSymbols | undefined =
    stakingAsset !== "ETH" ? stakingAsset : undefined;

  const allowanceResult = useTokenAllowance(
    tokenSymbol,
    account,
    ContractAddresses.ELF
  );

  return [allowanceResult.data, allowanceResult];
}
/**
 * helper hook to handle the deposit approval process
 * @param stakingAsset
 * @param account
 * @param amount amount to approve, defaults to the maximum allowed
 */
function useApprove(
  stakingAsset: StakingAssets,
  account: string | null | undefined,
  amount: BigNumber = MAX_ALLOWANCE
): [() => void, boolean] {
  const {
    mutate: approve,
    isLoading: approvePending,
  } = useElfContractApproveDeposit();

  const startApprove = useCallback(async () => {
    if (stakingAsset === "ETH") {
      return;
    }

    if (!account) {
      return;
    }

    approve({
      token: stakingAsset,
      account,
      amount,
    });
  }, [account, amount, approve, stakingAsset]);

  return [startApprove, approvePending];
}
/**
 * helper hook to handle the deposit process into the Elf contract
 * @param stakingAsset
 * @param account
 */
function useDeposit(
  stakingAsset: StakingAssets,
  account: string | null | undefined
): [(amount: BigNumber) => void, boolean] {
  const {
    mutate: depositEth,
    isLoading: depositEthIsLoading,
  } = useElfContractDepositEth();
  const {
    mutate: deposit,
    isLoading: depositIsLoading,
  } = useElfContractDeposit();

  const depositPending = depositIsLoading || depositEthIsLoading;

  const startDeposit = useCallback(
    async (amount: BigNumber) => {
      if (!account) {
        return;
      }
      if (stakingAsset === "ETH") {
        depositEth({
          amount,
          account,
        });
      } else {
        deposit({
          amount,
          account,
        });
      }
    },
    [account, deposit, depositEth, stakingAsset]
  );

  return [startDeposit, depositPending];
}

/**
 * helper hook to handle the withdraw process into the Elf contract
 * @param stakingAsset
 * @param account
 */
function useWithdraw(
  stakingAsset: StakingAssets,
  account: string | null | undefined
): [(amount: BigNumber) => void, boolean] {
  const {
    mutate: withdrawEth,
    isLoading: withdrawEthIsLoading,
  } = useElfContractWithdrawEth();
  const {
    mutate: withdraw,
    isLoading: withdrawIsLoading,
  } = useElfContractWithdraw();
  const withdrawPending = withdrawIsLoading || withdrawEthIsLoading;

  const startWithdraw = useCallback(
    async (amount: BigNumber) => {
      if (stakingAsset === "ETH") {
        withdrawEth({
          amount,
          account,
        });
      } else {
        withdraw({
          amount,
          account,
        });
      }
    },
    [account, stakingAsset, withdraw, withdrawEth]
  );

  return [startWithdraw, withdrawPending];
}

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
