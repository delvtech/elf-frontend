import React, { FC, Fragment, useCallback, useEffect, useState } from "react";

import { Button, Card, Classes, Intent } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { formatUnits, parseUnits } from "@ethersproject/units";
import { AbstractConnector } from "@web3-react/abstract-connector";
import classNames from "classnames";
import { Tranche } from "elf-contracts/types/Tranche";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { CryptoAssetWithIcon } from "efi-ui/crypto/CryptoAssetWithIcon";
import { useCryptoBalance } from "efi-ui/crypto/hooks/useCryptoBalance/useCryptoBalance";
import { useCryptoDecimals } from "efi-ui/crypto/hooks/useCryptoDecimals/useCryptoDecimals";
import { useCryptoSymbol } from "efi-ui/crypto/hooks/useCryptoSymbol/useCryptoSymbol";
import { CryptoAssetPicker } from "efi-ui/crypto/CryptoAssetPicker/CryptoAssetPicker";
import { BuyFYTConfirmationDrawer } from "efi-ui/invest/BuyFYTConfirmationDrawer/BuyFYTConfirmationDrawer";
import { useActiveTranche } from "efi-ui/invest/hooks/useActiveTranche";
import { TranchePicker } from "efi-ui/invest/TranchePicker/TranchePicker";
import { usePoolForToken } from "efi-ui/pools/usePoolForToken/usePoolForToken";
import { jsonRpcProvider } from "efi/providers/jsonRpcProviders";

import { InvestmentAmountInput } from "./InvestmentAmountInput";
import { ERC20Shim } from "efi-ui/contracts/ERC20Shim";
import { useQueryBatchSwap } from "efi-ui/balancer/useQueryBatchSwap/useQueryBatchSwap";
import { SwapKind } from "efi-ui/balancer/SwapKind";
import { usePoolSpotPrice } from "efi-ui/pools/usePoolSpotPrice/usePoolSpotPrice";
import { PrincipalDiscountPreview } from "./PrincipalDiscountPreview";
import { getTokenAddressForBalancer } from "efi-ui/swaps/getTokenAddressForBalancer";

export interface InvestCardProps {
  library: Web3Provider | undefined;
  account: string | null | undefined;

  chainId: number | undefined;
  walletConnectionActive: boolean;
  connector: AbstractConnector | undefined;
  baseAssets: (CryptoAssetWithIcon | undefined)[];

  tranchesByBaseAsset: Record<string, Tranche[]>;
}

/**
 * ActiveInput is used to prevent infinite calls to onSwapGivenIn and
 * onSwapGivenOut because they are not idempotent and will change based on
 * each other's latest result.
 */
type ActiveInput = "amountIn" | "amountOut";

export const calloutClassName = tw(
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
  const { activeBaseAsset, setActiveBaseAsset } = useActiveBaseAsset(
    baseAssets,
    setAmountIn,
    setAmountOut
  );

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

  // the tranche's pool
  const pool = usePoolForToken(activeTranche as ERC20Shim, jsonRpcProvider);
  const tranchePrice = usePoolSpotPrice(pool, activeTranche as ERC20Shim);
  const inputTokenSymbol = useCryptoSymbol(activeBaseAsset);

  // input calculations
  const amountInAsBigNumber = amountIn
    ? parseUnits(amountIn, activeBaseAssetDecimals)
    : undefined;

  const amountOutAsBigNumber = amountOut
    ? parseUnits(amountOut, trancheDecimals)
    : undefined;

  const tokenInAddress = getTokenAddressForBalancer(activeBaseAsset);

  const tokenOutAddress = activeTranche?.address;
  const sortedAssets = [tokenInAddress, tokenOutAddress].sort();
  const tokenInIndex = sortedAssets.findIndex(
    (address) => address === tokenInAddress
  );
  const tokenOutIndex = sortedAssets.findIndex(
    (address) => address === tokenOutAddress
  );
  const { data: queryBatchSwapInTokens = [] } = useQueryBatchSwap(
    SwapKind.GIVEN_IN,
    pool,
    tokenInAddress,
    tokenOutAddress,
    amountInAsBigNumber
  );
  const tokenOutFromBatchSwapIn = queryBatchSwapInTokens[tokenOutIndex];

  // the amount of base asset you must put in
  const { data: queryBatchSwapOutTokens = [] } = useQueryBatchSwap(
    SwapKind.GIVEN_OUT,
    pool,
    tokenInAddress,
    tokenOutAddress,
    amountOutAsBigNumber
  );
  const tokenInFromBatchSwapOut = queryBatchSwapOutTokens[tokenInIndex];

  // Effects to sync inputs
  // sync the the amount out input
  useSyncWithActiveInput(
    tokenOutFromBatchSwapIn
      ? formatUnits(tokenOutFromBatchSwapIn.abs(), trancheDecimals)
      : undefined,
    setAmountOut,
    activeInput,
    "amountOut"
  );
  // sync the the amount in input
  useSyncWithActiveInput(
    tokenInFromBatchSwapOut
      ? formatUnits(tokenInFromBatchSwapOut, activeBaseAssetDecimals)
      : undefined,
    setAmountIn,
    activeInput,
    "amountIn"
  );

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
          <PrincipalDiscountPreview
            amountIn={amountInAsBigNumber}
            baseAssetSymbol={activeBaseAssetSymbol}
            amountOut={amountOutAsBigNumber}
            baseAssetDecimals={activeBaseAssetDecimals}
          />
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

      {!activeBaseAsset ? null : (
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
      )}
    </Fragment>
  );
};

function useSetDefaultActiveBaseAsset(
  activeBaseAsset: CryptoAssetWithIcon | undefined,
  setActiveBaseAsset: (baseAsset: CryptoAssetWithIcon | undefined) => void,
  defaultBaseAsset: CryptoAssetWithIcon | undefined
) {
  useEffect(() => {
    if (activeBaseAsset === undefined) {
      setActiveBaseAsset(defaultBaseAsset);
    }
  }, [activeBaseAsset, defaultBaseAsset, setActiveBaseAsset]);
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

function useActiveBaseAsset(
  allBaseAssets: (CryptoAssetWithIcon | undefined)[],
  setAmountIn: (amount: string | undefined) => void,
  setAmountOut: (amount: string | undefined) => void
) {
  const [activeBaseAsset, setActiveBaseAssetState] = useState<
    CryptoAssetWithIcon | undefined
  >();
  const setActiveBaseAsset = useCallback(
    (baseAsset: CryptoAssetWithIcon | undefined) => {
      setActiveBaseAssetState(baseAsset);
      // clear the inputs when the base asset changes
      setAmountIn(undefined);
      setAmountOut(undefined);
    },
    [setAmountIn, setAmountOut]
  );
  // The list of base assets will be empty while the data loads, so we want to
  // set the default after it's been populated
  useSetDefaultActiveBaseAsset(
    activeBaseAsset,
    setActiveBaseAsset,
    allBaseAssets[0]
  );
  return { activeBaseAsset, setActiveBaseAsset };
}
