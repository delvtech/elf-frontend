import React, { FC, useCallback, useState } from "react";
import { QueryResult } from "react-query";

import { Button, Card, H3, Intent, Tag, Tooltip } from "@blueprintjs/core";
import { BigNumber } from "ethers";
import { formatEther } from "ethers/lib/utils";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { PieChart, PieData } from "efi-ui/charts/PieChart/PieChart";
import {
  useElfContractApproveDeposit,
  useElfContractAssetSymbols,
  useElfContractBalance,
  useElfContractDeposit,
  useElfContractDepositEth,
  useElfContractSymbol,
  useElfContractTotalSupply,
  useElfContractWithdraw,
  useElfContractWithdrawEth,
} from "efi-ui/contracts/useElfContract";
import { useCryptoDrawer } from "efi-ui/crypto/CryptoDrawer/useCryptoDrawer/useCryptoDrawer";
import { TransactionForm } from "efi-ui/crypto/TransactionForm/TransactionForm";
import { StakingAssetSelect } from "efi-ui/pools/StakingAssetSelect/StakingAssetSelect";
import { useTokenAllowance } from "efi-ui/token/hooks/useTokenAllowance";
import { useWallet } from "efi-ui/wallets/hooks/useWallet";
import { useWalletBalances } from "efi-ui/wallets/hooks/useWalletBalance";
import ContractAddresses from "efi/contracts/contractsJson";
import { MAX_ALLOWANCE } from "efi/contracts/token";
import { CryptoSymbol } from "efi/crypto/CryptoSymbol";
import { StakingAssets } from "efi/crypto/stakingAssets";
import { TokenBalance } from "efi/crypto/TokenBalance";
import { TokenContractSymbols } from "efi/crypto/TokenContractSymbols";
import { Pool } from "efi/pools/Pool";

interface PoolCardProps {
  strategy: Pool;
}

const stubbedPoolData: PieData[] = [
  { name: "yDAI", value: 100 },
  { name: "yUSDC", value: 300 },
  { name: "yUSDT", value: 150 },
  { name: "yTUSD", value: 150 },
];

export const PoolCard: FC<PoolCardProps> = ({ strategy }) => {
  const { name, stakingAsset: defaultStakingAsset } = strategy;
  const { account } = useWallet();
  const balances = useWalletBalances();
  const { data: strategyCryptoSymbol } = useElfContractSymbol();
  const { data: elfTotalSupply } = useElfContractTotalSupply();
  const elfBalance = useElfContractBalance(account);
  const { data: strategyAssetSymbols } = useElfContractAssetSymbols();
  const [stakingAsset, setStakingAsset] = useState<StakingAssets>(
    defaultStakingAsset
  );

  const [allowance, allowanceResult] = useAllowance(stakingAsset, account);
  const hasAllowance = allowance && allowance.gt(0);
  const allowanceLoading = allowanceResult.isLoading;

  const cryptoBalance = balances[stakingAsset];

  /****
   * Approve hooks
   ****/
  const [startApproval, approvalPending] = useApprove(stakingAsset, account);
  const [clearApproval, clearApprovalPending] = useApprove(
    stakingAsset,
    account,
    BigNumber.from(0)
  );

  /****
   * Deposit hooks
   ****/
  const [startDeposit, depositPending] = useDeposit(stakingAsset, account);

  /****
   * Withdraw hooks
   ****/
  const [startWithdraw, withdrawPending] = useWithdraw(stakingAsset, account);

  const { openCryptoDrawer } = useCryptoDrawer();
  const clickStakingAsset = useCallback(() => {
    openCryptoDrawer();
  }, [openCryptoDrawer]);

  // TODO: refactor elfTotalSupply to be a TokenBalance
  const totalSupply = elfTotalSupply && formatEther(elfTotalSupply);

  return (
    <Card className={tw("flex", "flex-col", "md:w-1/2", "transition-all")}>
      <div className={tw("flex", "mb-8", "items-center", "w-full")}>
        <div className={tw("flex", "flex-col", "space-y-8")}>
          {/* Pool name */}
          <H3>{name}</H3>

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
          <div className={tw("flex", "flex-col", "space-y-4")}>
            <span>{t`Total supply`}</span>
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
          <PieChart pieData={stubbedPoolData} />
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
          {cryptoBalance?.decimals && cryptoBalance?.value && (
            <TransactionForm
              inputLabel={t`Deposit`}
              cryptoSymbol={stakingAsset}
              cryptoBalance={cryptoBalance as TokenBalance}
              buttonIntent={depositPending ? Intent.WARNING : Intent.PRIMARY}
              buttonEnabled={!depositPending}
              buttonLabel={
                depositPending
                  ? t`Confirming deposit...`
                  : t`Deposit ${stakingAsset}`
              }
              onTransaction={startDeposit}
            />
          )}
        </div>

        <div className={tw("flex-1")}>
          {/* Withdraw */}
          <TransactionForm
            inputLabel={t`Withdraw`}
            cryptoSymbol={strategyCryptoSymbol as CryptoSymbol}
            cryptoBalance={elfBalance}
            buttonIntent={withdrawPending ? Intent.WARNING : Intent.PRIMARY}
            buttonEnabled={!withdrawPending}
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
): [BigNumber | undefined, QueryResult<BigNumber | undefined>] {
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
  const [approve, approveResult] = useElfContractApproveDeposit();

  const approvePending = approveResult.isLoading;

  const startApprove = useCallback(async () => {
    if (stakingAsset === "ETH") {
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
  const [depositEth, depositEthResult] = useElfContractDepositEth();
  const [deposit, depositResult] = useElfContractDeposit();

  const depositPending = depositResult.isLoading || depositEthResult.isLoading;

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
  const [withdrawEth, withdrawEthResult] = useElfContractWithdrawEth();
  const [withdraw, withdrawResult] = useElfContractWithdraw();
  const withdrawPending =
    withdrawResult.isLoading || withdrawEthResult.isLoading;

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
