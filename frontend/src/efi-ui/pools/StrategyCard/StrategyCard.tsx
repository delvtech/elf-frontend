import React, { FC, Fragment, useCallback, useState } from "react";

import {
  Button,
  Card,
  H3,
  Intent,
  Menu,
  MenuItem,
  Popover,
  Position,
  Tag,
  Tooltip,
} from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { BigNumber, ContractTransaction } from "ethers";
import { formatEther } from "ethers/lib/utils";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import {
  AppToaster,
  makeErrorToast,
  makeSuccessToast,
} from "efi-ui/app/AppToaster/AppToaster";
import { PieChart, PieData } from "efi-ui/charts/PieChart/PieChart";
import {
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
import { CryptoIcon } from "efi-ui/crypto/CryptoIcon";
import { TransactionForm } from "efi-ui/crypto/TransactionForm/TransactionForm";
import { useWallet } from "efi-ui/wallets/hooks/useWallet";
import { CryptoName } from "efi/crypto/CryptoName";
import { CryptoSymbol } from "efi/crypto/CryptoSymbol";
import { stakingAssets, StakingAssets } from "efi/crypto/stakingAssets";
import { Strategy } from "efi/pools/strategy";

interface StrategyCardProps {
  strategy: Strategy;
}

const stubbedStrategyData: PieData[] = [
  { name: "yDAI", value: 100 },
  { name: "yUSDC", value: 300 },
  { name: "yUSDT", value: 150 },
  { name: "yTUSD", value: 150 },
];

export const StrategyCard: FC<StrategyCardProps> = ({ strategy }) => {
  const { name, stakingAsset: defaultStakingAsset } = strategy;
  const { balances, account } = useWallet();
  const { data: strategyCryptoSymbol } = useElfContractSymbol();
  const { data: elfTotalSupply } = useElfContractTotalSupply();
  const elfBalance = useElfContractBalance(account);
  const { data: strategyAssetSymbols } = useElfContractAssetSymbols();

  const [stakingAsset, setStakingAsset] = useState<StakingAssets>(
    defaultStakingAsset
  );

  const cryptoBalance = balances[stakingAsset];

  /****
   * Deposit hooks
   ****/
  const [, setAmountToDeposit] = useState<BigNumber | undefined>();

  const { depositEth } = useElfContractDepositEth();
  const { deposit } = useElfContractDeposit();

  const [depositStarted, setDepositStarted] = useState(false);
  const [, setPendingTransaction] = useState<ContractTransaction>();

  // TODO: refactor this out to its own hook.
  const startDeposit = useCallback(
    async (amount: BigNumber) => {
      setDepositStarted(true);
      setAmountToDeposit(amount);
      try {
        const depositFn = stakingAsset === "ETH" ? depositEth : deposit;
        const depositTransaction = await depositFn({ amount, account });
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
    [account, deposit, depositEth, stakingAsset]
  );

  /****
   * Withdraw hooks
   ****/
  const [amountToWithdraw, setAmountToWithdraw] = useState<
    BigNumber | undefined
  >();
  const { withdrawEth } = useElfContractWithdrawEth(amountToWithdraw);
  const { withdraw } = useElfContractWithdraw(amountToWithdraw);
  const [withdrawStarted, setWithdrawStarted] = useState(false);
  // TODO: refactor this out to its own hook.
  const startWithdraw = useCallback(
    async (amount: BigNumber) => {
      setWithdrawStarted(true);
      setAmountToWithdraw(amount);
      const withdrawFn = stakingAsset === "ETH" ? withdrawEth : withdraw;
      try {
        const withdrawTransaction = await withdrawFn({ amount, account });
        // TODO: this should listen to queryCache
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
    [account, stakingAsset, withdraw, withdrawEth]
  );

  const { openCryptoDrawer } = useCryptoDrawer();
  const clickStakingAsset = useCallback(() => {
    openCryptoDrawer();
  }, [openCryptoDrawer]);

  const totalSupply = elfTotalSupply && formatEther(elfTotalSupply);

  return (
    <Card className={tw("flex", "flex-col", "md:w-1/2", "transition-all")}>
      <div className={tw("flex", "mb-8", "items-center", "w-full")}>
        <div className={tw("flex", "flex-col", "space-y-8")}>
          {/* Strategy name */}
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
          <PieChart pieData={stubbedStrategyData} />
        </div>
      </div>
      <div className={tw("flex", "w-full", "space-x-8", "pt-4")}>
        <div className={tw("flex-1")}>
          <Popover
            content={
              <Menu>
                <Fragment>
                  {stakingAssets.map((asset) => (
                    <MenuItem
                      onClick={() => setStakingAsset(asset)}
                      icon={
                        <img
                          className={tw("h-5", "w-5")}
                          src={CryptoIcon[asset]}
                          alt={CryptoName[asset]}
                        />
                      }
                      key={asset}
                      text={CryptoName[asset]}
                    />
                  ))}
                </Fragment>
              </Menu>
            }
            position={Position.BOTTOM_LEFT}
            minimal
          >
            <Button
              rightIcon={IconNames.CARET_DOWN}
              text={CryptoName[stakingAsset]}
            />
          </Popover>
        </div>
        <div className={tw("flex-1")}>
          <Popover
            content={
              <Menu>
                {stakingAssets.map((asset) => (
                  <MenuItem
                    onClick={() => setStakingAsset(asset)}
                    icon={
                      <img
                        className={tw("h-5", "w-5")}
                        src={CryptoIcon[asset]}
                        alt={CryptoName[asset]}
                      />
                    }
                    key={asset}
                    text={CryptoName[asset]}
                  />
                ))}
              </Menu>
            }
            position={Position.BOTTOM_LEFT}
            minimal
          >
            <Button
              rightIcon={IconNames.CARET_DOWN}
              text={CryptoName[stakingAsset]}
            />
          </Popover>
        </div>
      </div>
      <div
        className={tw("flex", "justify-between", "w-full", "space-x-8", "pt-4")}
      >
        <div className={tw("flex-1")}>
          {/* Deposit */}
          <TransactionForm
            inputLabel={t`Deposit`}
            cryptoSymbol={stakingAsset}
            cryptoBalance={cryptoBalance}
            buttonIntent={depositStarted ? Intent.WARNING : Intent.PRIMARY}
            buttonEnabled={!depositStarted}
            buttonLabel={
              depositStarted
                ? t`Confirming deposit...`
                : t`Deposit ${stakingAsset}`
            }
            onTransaction={startDeposit}
          />
        </div>

        <div className={tw("flex-1")}>
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
      </div>
    </Card>
  );
};
