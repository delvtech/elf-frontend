import React, { FC, Fragment, useCallback, useEffect, useState } from "react";

import {
  Button,
  Callout,
  Card,
  Classes,
  Colors,
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
import { CryptoAssetPicker } from "efi-ui/crypto/CryptoAssetPicker/CryptoAssetPicker";
import { BuyFYTConfirmationDrawer } from "efi-ui/invest/BuyFYTConfirmationDrawer/BuyFYTConfirmationDrawer";
import { useActiveTranche } from "efi-ui/invest/hooks/useActiveTranche";
import { TranchePicker } from "efi-ui/invest/TranchePicker/TranchePicker";
import { useOnSwapGivenIn } from "efi-ui/pools/useOnSwapGivenIn/useOnSwapGivenIn";
import { usePoolForToken } from "efi-ui/pools/usePoolForToken/usePoolForToken";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { formatCurrency } from "efi/base/formatCurrency/formatCurrency";
import ContractAddresses from "efi/contracts/contractsJson";
import { CryptoAssetType } from "efi/crypto/CryptoAsset";
import { ONE_ETHER } from "efi/crypto/ethereum";
import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";

import { InvestmentAmountInput } from "./InvestmentAmountInput";
import { useOnSwapGivenOut } from "efi-ui/pools/useOnSwapGivenIn/useOnSwapGivenOut";
import { ERC20Shim } from "efi-ui/contracts/ERC20Shim";

export interface InvestCardProps {
  library: Web3Provider | undefined;
  account: string | null | undefined;

  chainId: number | undefined;
  walletConnectionActive: boolean;
  connector: AbstractConnector | undefined;
  baseAssets: CryptoAssetWithIcon[];

  tranchesByBaseAsset: Record<string, Tranche[]>;
}

/**
 * ActiveInput is used to prevent infinite calls to onSwapGivenIn and
 * onSwapGivenOut because they are not idempotent and will change based on
 * each other's latest result.
 */
type ActiveInput = "amountIn" | "amountOut";

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
  // prefs
  const { isDarkMode } = useDarkMode();

  // local state
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [activeInput, setActiveInput] = useState<ActiveInput>("amountIn");
  const [amountIn, setAmountIn] = useState<string | undefined>();
  const [amountOut, setAmountOut] = useState<string | undefined>();
  const onAmountInChange = useCallback((newAmountIn: string) => {
    setActiveInput("amountIn");
    setAmountIn(newAmountIn);
  }, []);
  const onAmountOutChange = useCallback((newAmountOut: string) => {
    setActiveInput("amountOut");
    setAmountOut(newAmountOut);
  }, []);

  // base asset
  const [activeBaseAsset, setActiveBaseAsset] = useState(baseAssets[0]);
  const activeBaseAssetSymbol = useCryptoSymbol(activeBaseAsset);
  const activeBaseAssetDecimals = useCryptoDecimals(activeBaseAsset);
  const activeBaseAssetBalance = useCryptoBalance(
    library,
    account,
    activeBaseAsset
  );

  // tranche
  const {
    activeTrancheIndex,
    activeTranche,
    availableTranches,
    setActiveTranche,
  } = useActiveTranche(tranchesByBaseAsset, activeBaseAsset);
  const { data: trancheDecimals } = useSmartContractReadCall(
    activeTranche,
    "decimals"
  );
  const pool = usePoolForToken(activeTranche as ERC20Shim, jsonRpcProvider);
  const tranchePriceResult = useOnSwapGivenIn(
    pool,
    activeTranche as ERC20Shim,
    ONE_ETHER
  );

  // use weth when the base asset is eth
  const wethContract = useSmartContractFromFactory(
    ContractAddresses.wethAddress,
    WETH__factory.connect
  );
  let inputToken: WETH | ERC20 | undefined = wethContract;
  if (activeBaseAsset.type === CryptoAssetType.ERC20) {
    inputToken = activeBaseAsset.tokenContract;
  }
  const { data: inputTokenSymbol } = useSmartContractReadCall(
    inputToken,
    "symbol"
  );

  // input calculations
  const amountInAsBigNumber = amountIn
    ? parseUnits(amountIn, activeBaseAssetDecimals)
    : undefined;

  const amountOutAsBigNumber = amountOut
    ? parseUnits(amountOut, trancheDecimals)
    : undefined;

  // the amount of tranche you get out
  const { data: swapGivenIn } = useOnSwapGivenIn(
    pool,
    inputToken,
    amountInAsBigNumber
  );

  // the amount of base asset you must put in
  const { data: swapGivenOut } = useOnSwapGivenOut(
    pool,
    activeTranche as ERC20Shim,
    amountOutAsBigNumber
  );

  // Effects to sync inputs
  // sync the inputs for amount in and out
  // when we get a new result for the swapAmountOut, update the text input to reflect it
  // when we get a new result for the swapAmountIn, update the text input to reflect it
  useSyncWithActiveInput(
    swapGivenIn ? formatUnits(swapGivenIn, activeBaseAssetDecimals) : undefined,
    setAmountOut,
    activeInput,
    "amountOut"
  );
  useSyncWithActiveInput(
    swapGivenOut
      ? formatUnits(swapGivenOut, activeBaseAssetDecimals)
      : undefined,
    setAmountIn,
    activeInput,
    "amountIn"
  );

  const totalYield = calculateTotalYield(
    swapGivenIn,
    amountInAsBigNumber,
    activeBaseAssetDecimals
  );

  const percentYield = calculatePercentYield(amountIn, totalYield);

  const tranchePriceBigNumber = getQueryData(tranchePriceResult);
  const tranchePrice = +formatCurrency(tranchePriceBigNumber, trancheDecimals);

  const roundedTranchePrice = tranchePrice.toFixed(4);
  const marketRateLabel = t`1 ${inputTokenSymbol} Principal Token ≈ ${roundedTranchePrice} ${activeBaseAssetSymbol}`;

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
                <CryptoAssetPicker
                  cryptoAssets={baseAssets}
                  activeCryptoAsset={activeBaseAsset}
                  onCryptoAssetChange={setActiveBaseAsset}
                />
              }
              placeholder="0.00"
              value={amountIn}
              onValueChange={onAmountInChange}
              assetBalance={activeBaseAssetBalance}
            />
          </div>
        </div>
        <div className={tw("flex", "flex-col", "space-y-2")}>
          <div className={tw("flex", "justify-between")}>
            <span
              className={classNames(tw("text-base"), Classes.TEXT_MUTED)}
            >{t`To`}</span>
            <span className={classNames(tw("text-base"), Classes.TEXT_MUTED)}>
              {marketRateLabel}
            </span>
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
              onValueChange={onAmountOutChange}
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
              textClassName={tw("text-base")}
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
        amountIn={amountIn}
        tranche={activeTranche}
        isOpen={isDrawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </Fragment>
  );
};

function calculatePercentYield(
  amountIn: string | undefined,
  totalYield: number
) {
  let percentYield = 0;
  if (amountIn) {
    percentYield = (totalYield / +amountIn) * 100;
  }
  return percentYield;
}

function calculateTotalYield(
  amountOut: BigNumber | undefined,
  amountIn: BigNumber | undefined,
  decimalsAmountIn: number
) {
  let totalYield = 0;
  if (amountOut) {
    const yieldAsBigNumber = amountOut.sub(amountIn || 0);
    totalYield = +formatUnits(yieldAsBigNumber, decimalsAmountIn);
  }
  return totalYield;
}

/**
 * When the swap amount changes, we need to update the text input.
 */
function useSyncWithActiveInput(
  newAmount: string | undefined,
  setAmount: React.Dispatch<React.SetStateAction<string | undefined>>,
  activeInput: ActiveInput,
  syncWithInput: ActiveInput
) {
  useEffect(() => {
    // don't update the active input out from under the user.
    if (activeInput === syncWithInput) {
      return;
    }

    if (!newAmount) {
      setAmount(undefined);
      return;
    }

    // Otherwise, if we have a new amount we'll set it
    const roundedAmount = (+newAmount).toFixed(4);
    setAmount(roundedAmount);
  }, [setAmount, newAmount, activeInput, syncWithInput]);
}
