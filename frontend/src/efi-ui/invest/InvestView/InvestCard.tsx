import React, { FC, Fragment, useEffect, useState } from "react";

import {
  Button,
  Callout,
  Card,
  Classes,
  Colors,
  Icon,
  Intent,
} from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { formatUnits, parseUnits } from "@ethersproject/units";
import { AbstractConnector } from "@web3-react/abstract-connector";
import classNames from "classnames";
import { ERC20 } from "elf-contracts/types/ERC20";
import { WETH__factory } from "elf-contracts/types/factories/WETH__factory";
import { Tranche } from "elf-contracts/types/Tranche";
import { WETH } from "elf-contracts/types/WETH";
import { BigNumber } from "ethers";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { getQueryData } from "efi-ui/base/queryResults";
import { useSmartContractFromFactory } from "efi-ui/contracts/useSmartContractFromFactory/useSmartContractFromFactory";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { CryptoAssetWithIcon } from "efi-ui/crypto/CryptoAssetWithIcon";
import { useCryptoBalance } from "efi-ui/crypto/hooks/useCryptoBalance/useCryptoBalance";
import { useCryptoDecimals } from "efi-ui/crypto/hooks/useCryptoDecimals/useCryptoDecimals";
import { useCryptoSymbol } from "efi-ui/crypto/hooks/useCryptoSymbol/useCryptoSymbol";
import { BaseAssetPicker } from "efi-ui/invest/BaseAssetPicker/BaseAssetPicker";
import { BuyFYTConfirmationDrawer } from "efi-ui/invest/BuyFYTConfirmationDrawer/BuyFYTConfirmationDrawer";
import { useActiveTranche } from "efi-ui/invest/hooks/useActiveTranche";
import { TranchePicker } from "efi-ui/invest/TranchePicker/TranchePicker";
import { useOnSwapGivenIn } from "efi-ui/pools/useOnSwapGivenIn/useOnSwapGivenIn";
import { usePoolForToken } from "efi-ui/pools/usePoolForToken/usePoolForToken";
import { formatCurrency } from "efi/base/formatCurrency/formatCurrency";
import ContractAddresses from "efi/contracts/contractsJson";
import { CryptoAssetType } from "efi/crypto/CryptoAsset";
import { ONE_ETHER } from "efi/crypto/ethereum";
import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";

import { InvestmentAmountInput } from "./InvestmentAmountInput";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { IconNames } from "@blueprintjs/icons";

export interface InvestCardProps {
  library: Web3Provider | undefined;
  account: string | null | undefined;

  chainId: number | undefined;
  walletConnectionActive: boolean;
  connector: AbstractConnector | undefined;
  baseAssets: CryptoAssetWithIcon[];

  tranchesByBaseAsset: Record<string, Tranche[]>;
}

const calloutClassName = tw(
  "flex",
  "flex-col",
  "flex-1",
  "h-full",
  "p-8",
  "items-center",
  "justify-center"
);
export const InvestCard: FC<InvestCardProps> = ({
  library,
  account,
  baseAssets,
  chainId,
  connector,
  walletConnectionActive,
  tranchesByBaseAsset,
}) => {
  const { isDarkMode } = useDarkMode();
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [amountIn, setAmountIn] = useState<string | undefined>();
  const [amountOut, setAmountOut] = useState<string | undefined>();

  const [activeBaseAsset, setActiveBaseAsset] = useState(baseAssets[0]);
  const activeBaseAssetSymbol = useCryptoSymbol(activeBaseAsset);
  const activeBaseAssetDecimals = useCryptoDecimals(activeBaseAsset);
  const activeBaseAssetBalance = useCryptoBalance(
    library,
    account,
    activeBaseAsset
  );

  const {
    activeTrancheIndex,
    activeTranche,
    availableTranches,
    setActiveTranche,
  } = useActiveTranche(tranchesByBaseAsset, activeBaseAsset);

  const trancheDecimalsResult = useSmartContractReadCall(
    activeTranche,
    "decimals"
  );
  const pool = usePoolForToken(activeTranche, jsonRpcProvider);
  const tranchePriceResult = useOnSwapGivenIn(pool, activeTranche, ONE_ETHER);

  const wethContract = useSmartContractFromFactory(
    ContractAddresses.wethAddress,
    WETH__factory.connect
  );
  let inputToken: WETH | ERC20 | undefined = wethContract;
  if (activeBaseAsset.type === CryptoAssetType.ERC20) {
    inputToken = activeBaseAsset.tokenContract;
  }

  const amountInAsBigNumber = amountIn
    ? parseUnits(amountIn, activeBaseAssetDecimals)
    : undefined;

  const { data: swapAmountOut } = useOnSwapGivenIn(
    pool,
    inputToken,
    amountInAsBigNumber
  );

  // sync the amount in and amount out
  useUpdateAmountOut(swapAmountOut, setAmountOut, activeBaseAssetDecimals);

  let totalYield = 0;
  if (swapAmountOut) {
    const yieldAsBigNumber = swapAmountOut.sub(amountInAsBigNumber || 0);
    totalYield = +formatUnits(yieldAsBigNumber, activeBaseAssetDecimals);
  }

  let percentYield = 0;
  if (amountIn) {
    percentYield = (totalYield / +amountIn) * 100;
  }

  const tranchePriceBigNumber = getQueryData(tranchePriceResult);
  const tranchePrice = +formatCurrency(
    tranchePriceBigNumber,
    getQueryData(trancheDecimalsResult)
  );

  return (
    <Fragment>
      <Card className={tw("flex", "flex-col", "p-10", "flex-1", "space-y-10")}>
        <div className={tw("flex", "flex-col", "space-y-2")}>
          <div className={tw("flex", "justify-between")}>
            <span
              className={classNames(tw("text-base"), Classes.TEXT_MUTED)}
            >{t`From`}</span>
            {!!account && (
              <span
                className={classNames(tw("text-base"), Classes.TEXT_MUTED)}
              >{t`Balance: ${activeBaseAssetBalance.toFixed(
                4
              )} ${activeBaseAssetSymbol}`}</span>
            )}
          </div>
          <div
            className={tw(
              "flex",
              "space-x-1",
              "h-24",
              "border",
              "rounded",
              "border-gray-500"
            )}
          >
            <InvestmentAmountInput
              showMaxButton={!!account}
              baseAssetPicker={
                <BaseAssetPicker
                  baseAssets={baseAssets}
                  activeBaseAsset={activeBaseAsset}
                  onBaseAssetChange={setActiveBaseAsset}
                />
              }
              placeholder="0.00"
              value={amountIn}
              onValueChange={setAmountIn}
              assetBalance={activeBaseAssetBalance}
            />
          </div>
        </div>
        <div className={tw("flex", "flex-col", "space-y-2")}>
          <div className={tw("flex", "justify-between")}>
            <span
              className={classNames(tw("text-base"), Classes.TEXT_MUTED)}
            >{t`To`}</span>
            <span
              className={classNames(tw("text-base"), Classes.TEXT_MUTED)}
            >{t`1 ${activeBaseAssetSymbol} Principal Token = ${tranchePrice.toFixed(
              4
            )} ${activeBaseAssetSymbol}`}</span>
          </div>
          <div
            className={tw(
              "flex",
              "space-x-1",
              "h-24",
              "border",
              "rounded",
              "border-gray-500"
            )}
          >
            <InvestmentAmountInput
              showMaxButton={false}
              baseAssetPicker={
                <TranchePicker
                  library={library}
                  account={account}
                  onTrancheChange={setActiveTranche}
                  tranches={availableTranches}
                  activeTrancheIndex={activeTrancheIndex}
                />
              }
              placeholder="0.00"
              value={amountOut}
              onValueChange={setAmountOut}
              assetBalance={activeBaseAssetBalance}
            />
          </div>
        </div>

        <div className={tw("flex", "space-x-10", "h-24", "mt-10")}>
          <Callout className={calloutClassName}>
            <LabeledText
              muted={false}
              bold
              className={tw(
                "flex",
                "justify-center",
                "flex-col-reverse",
                "items-center"
              )}
              text={
                !amountIn ? (
                  t`Enter an amount`
                ) : (
                  <Fragment>
                    <span>
                      {`${totalYield.toFixed(4)} ${activeBaseAssetSymbol}`}
                    </span>{" "}
                    <span
                      style={{
                        color: isDarkMode ? Colors.GREEN5 : Colors.GREEN3,
                      }}
                    >{`(+${percentYield.toFixed(2)}%)`}</span>
                  </Fragment>
                )
              }
              label={t`Yield at term`}
            />
          </Callout>
          <Button
            large
            outlined
            intent={Intent.PRIMARY}
            className={tw("flex-1")}
            disabled={!amountIn}
            onClick={() => setDrawerOpen(true)}
          >
            <div className={tw("p-4", "text-lg")}>{t`Buy`}</div>
          </Button>
        </div>
      </Card>

      <BuyFYTConfirmationDrawer
        account={account}
        library={library}
        chainId={chainId}
        pool={pool}
        walletConnectionActive={walletConnectionActive}
        connector={connector}
        baseAsset={activeBaseAsset}
        amount={amountIn}
        tranche={activeTranche}
        isOpen={isDrawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </Fragment>
  );
};

function useUpdateAmountOut(
  swapAmountOut: BigNumber | undefined,
  setAmountOut: React.Dispatch<React.SetStateAction<string | undefined>>,
  activeBaseAssetDecimals: number
) {
  useEffect(() => {
    if (!swapAmountOut) {
      setAmountOut(undefined);
      return;
    }

    const newAmountAsNumber = +formatUnits(
      swapAmountOut,
      activeBaseAssetDecimals
    );
    const newAmountOut = newAmountAsNumber.toFixed(4);

    setAmountOut(newAmountOut);
  }, [activeBaseAssetDecimals, setAmountOut, swapAmountOut]);
}
