import React, {
  Fragment,
  ReactElement,
  useCallback,
  useEffect,
  useState,
} from "react";

import { Button, Card, Classes, Elevation, Intent } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import classNames from "classnames";
import { formatEther, formatUnits } from "ethers/lib/utils";
import { PrincipalTokenInfo } from "tokenlists/types";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { SwapKind } from "efi-ui/balancer/SwapKind";
import { useNumericInput } from "efi-ui/base/hooks/useNumericInput/useNumericInput";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { CryptoAssetPicker } from "efi-ui/crypto/CryptoAssetPicker/CryptoAssetPicker";
import { findAssetIcon2 } from "efi-ui/crypto/CryptoIcon";
import { useCryptoBalance } from "efi-ui/crypto/hooks/useCryptoBalance/useCryptoBalance";
import { PrincipalDiscountPreview } from "efi-ui/earn/EarnCard/PrincipalDiscountPreview";
import { EarnInput } from "efi-ui/earn/EarnInput/EarnInput";
import { EarnTermPicker } from "efi-ui/earn/EarnTermPicker/EarnTermPicker";
import { useActiveTranche } from "efi-ui/earn/hooks/useActiveTranche";
import { usePoolTokenPrices } from "efi-ui/pools/usePoolTokenPrices/usePoolTokenPrices";
import { usePoolTokens } from "efi-ui/pools/usePoolTokens/usePoolTokens";
import { BuyPrincipalTokensTransactionConfirmationDrawer } from "efi-ui/swaps/BuyPrincipalTokensTransactionConfirmationDrawer/BuyPrincipalTokensTransactionConfirmationDrawer";
import { useTokenBalanceOf } from "efi-ui/token/hooks/useTokenBalanceOf";
import { ConnectWalletDialog } from "efi-ui/wallets/ConnectWalletDialog/ConnectWalletDialog";
import { formatBalance } from "efi/base/formatBalance";
import { CryptoAsset } from "efi/crypto/CryptoAsset";
import { getCryptoDecimals } from "efi/crypto/getCryptoDecimals";
import { getCryptoSymbol } from "efi/crypto/getCryptoSymbol";
import { clipStringValueToDecimals } from "efi/math/fixedPoint";
import { calcSwapOutGivenInCCPoolUNSAFE } from "efi/pools/calcPoolSwap";
import {
  getPrincipalPoolContractForTranche,
  getPrincipalPoolForTranche,
} from "efi/pools/ccpool";
import { useParseSortedTokensForPool } from "efi/pools/parseSortedTokensForPool";
import { getTokenInfo } from "efi/tokenlists";
import { validateTradeValues } from "efi/trade/validateTradeValues";
import { openTrancheBaseAssets } from "efi/tranche/baseAssets";
import { UnderlyingContracts } from "efi/underlying/underlying";

export interface EarnCardProps {
  library: Web3Provider | undefined;
  account: string | null | undefined;
}

export function EarnCard({ library, account }: EarnCardProps): ReactElement {
  const [isWalletDialogOpen, setWalletDialogOpen] = useState(false);
  // local state
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeWalletDialog = useCallback(() => setWalletDialogOpen(false), []);
  const onClickButton = useCallback(() => {
    if (!account) {
      return setWalletDialogOpen(true);
    }
    openDrawer();
  }, [account, openDrawer]);

  const { stringValue: amountIn, setValue: setAmountIn } = useNumericInput();
  const { stringValue: amountOut, setValue: setAmountOut } = useNumericInput();
  const clearInputs = useCallback(() => {
    setAmountIn("");
    setAmountOut("");
  }, [setAmountIn, setAmountOut]);
  const closeDrawer = useCallback(() => {
    clearInputs();
    setDrawerOpen(false);
  }, [clearInputs]);

  // base asset
  const { activeBaseAsset, setActiveBaseAsset } =
    useActiveBaseAsset(clearInputs);
  const activeBaseAssetSymbol = getCryptoSymbol(activeBaseAsset);
  const activeBaseAssetDecimals = getCryptoDecimals(activeBaseAsset);
  const activeBaseAssetBalanceOf = useCryptoBalance(
    library,
    account,
    activeBaseAsset
  );
  const activeBaseAssetDisplayBalance = formatBalance(
    activeBaseAssetBalanceOf,
    activeBaseAssetDecimals
  );
  const baseAssetSymbol = getCryptoSymbol(activeBaseAsset);
  const baseAssetIcon = findAssetIcon2(activeBaseAsset);

  // principal token
  const {
    activeTrancheIndex,
    activeTranche,
    availableTranches,
    setActiveTranche,
  } = useActiveTranche(activeBaseAsset);
  const { decimals: principalTokenDecimals } = getTokenInfo<PrincipalTokenInfo>(
    activeTranche.address
  );

  const { data: principalTokenBalanceOf } = useTokenBalanceOf(
    activeTranche,
    account
  );

  // pool
  const {
    extensions: { expiration, unitSeconds, underlying },
  } = getPrincipalPoolForTranche(activeTranche.address);

  const poolContract = getPrincipalPoolContractForTranche(
    activeTranche.address
  );

  // TODO: use a global Date.now that updates at a constant interval
  const nowInSeconds = Math.round(Date.now() / 1000);
  const timeRemainingSeconds = expiration - nowInSeconds;
  const tParamSeconds = unitSeconds;

  const { data: totalSupplyBN } = useSmartContractReadCall(
    poolContract,
    "totalSupply"
  );
  const totalSupply = formatEther(totalSupplyBN ?? 0);

  const { data: [tokens, balances = []] = [] } = usePoolTokens(poolContract);
  const { baseAssetIndex, termAssetIndex: principalTokenIndex } =
    useParseSortedTokensForPool(tokens);
  const baseAssetReservesBalanceOf = balances[baseAssetIndex];
  const principalReservesBalanceOf = balances[principalTokenIndex];
  const baseReserves = formatUnits(
    baseAssetReservesBalanceOf ?? 0,
    activeBaseAssetDecimals
  );
  const principalReserves = formatUnits(
    principalReservesBalanceOf ?? 0,
    activeBaseAssetDecimals
  );

  const underlyingPoolTokenContract = UnderlyingContracts[underlying];
  const { spotPriceBaseAssetForOneToken: amountOfEthForOnePrincipalEth } =
    usePoolTokenPrices(poolContract, underlyingPoolTokenContract);

  const {
    isValidTokenInValue,
    isValidTokenOutValue,
    tokenInError,
    tokenOutError,
  } = validateTradeValues(
    amountIn,
    amountOut,
    baseAssetReservesBalanceOf,
    principalReservesBalanceOf,
    activeBaseAssetBalanceOf,
    activeBaseAssetDecimals
  );

  const onChangeIn = useCallback(
    (newAmountIn: string, swapKind: SwapKind) => {
      if (!newAmountIn) {
        clearInputs();
        return;
      }
      const newAmountOutNumber = calcSwapOutGivenInCCPoolUNSAFE(
        newAmountIn,
        baseReserves,
        principalReserves,
        totalSupply,
        timeRemainingSeconds,
        tParamSeconds,
        true
      );
      const newAmountOut = clipStringValueToDecimals(
        newAmountOutNumber.toString(),
        activeBaseAssetDecimals ?? 18
      );
      setAmountIn(newAmountIn);
      setAmountOut(newAmountOut);
    },
    [
      activeBaseAssetDecimals,
      baseReserves,
      clearInputs,
      principalReserves,
      setAmountIn,
      setAmountOut,
      tParamSeconds,
      timeRemainingSeconds,
      totalSupply,
    ]
  );

  const onChangeOut = useCallback(
    (newAmountOut: string, swapKind: SwapKind) => {
      if (!newAmountOut) {
        clearInputs();
        return;
      }
      const newAmountInNumber = calcSwapOutGivenInCCPoolUNSAFE(
        newAmountOut,
        baseReserves,
        principalReserves,
        totalSupply,
        timeRemainingSeconds,
        tParamSeconds,
        true
      );
      const newAmountIn = clipStringValueToDecimals(
        newAmountInNumber.toString(),
        activeBaseAssetDecimals ?? 18
      );
      setAmountIn(newAmountIn);
      setAmountOut(newAmountOut);
    },
    [
      activeBaseAssetDecimals,
      baseReserves,
      clearInputs,
      principalReserves,
      setAmountIn,
      setAmountOut,
      tParamSeconds,
      timeRemainingSeconds,
      totalSupply,
    ]
  );

  // need to recalculate output when a new term is selected.
  useEffect(() => {
    onChangeIn(amountIn ?? "", SwapKind.GIVEN_IN);
  }, [activeTranche]); // eslint-disable-line react-hooks/exhaustive-deps

  const roundedPrincipalPrice = amountOfEthForOnePrincipalEth?.toFixed(4);
  const marketRateLabel = getMarketRateLabel(
    baseAssetSymbol,
    roundedPrincipalPrice,
    activeBaseAssetSymbol
  );

  // true if undefined or zero value
  const noAmountIn = amountIn ? !+amountIn : true;

  const buttonDisabled =
    (!!account && (!isValidTokenInValue || !isValidTokenOutValue)) ||
    noAmountIn;
  const buttonLabel = !!account ? t`Buy` : t`Connect Wallet`;

  const assetPickerRenderer = useCallback(
    () => (
      <CryptoAssetPicker
        cryptoAssets={openTrancheBaseAssets}
        activeCryptoAsset={activeBaseAsset}
        onCryptoAssetChange={setActiveBaseAsset}
      />
    ),
    [activeBaseAsset, setActiveBaseAsset]
  );

  const termPickerRenderer = useCallback(
    () => (
      <EarnTermPicker
        account={account}
        onTrancheChange={setActiveTranche}
        tranches={availableTranches}
        activeTrancheIndex={activeTrancheIndex}
      />
    ),
    [account, activeTrancheIndex, availableTranches, setActiveTranche]
  );

  return (
    <Fragment>
      <Card
        elevation={isDrawerOpen ? Elevation.ZERO : Elevation.TWO}
        className={tw("flex", "flex-col", "p-10", "flex-1", "space-y-10")}
      >
        <div className={tw("flex", "flex-col", "space-y-2")}>
          <div className={tw("flex", "justify-between")}>
            <span
              className={classNames(tw("text-base"), Classes.TEXT_MUTED)}
            >{t`From`}</span>
            {!!account && (
              <span
                className={classNames(tw("text-base"), Classes.TEXT_MUTED)}
              >{t`Balance: ${activeBaseAssetDisplayBalance} ${activeBaseAssetSymbol}`}</span>
            )}
          </div>
          <div
            className={tw("flex", "space-x-1", "h-24", "border", "rounded", {
              "border-gray-500": isValidTokenInValue,
              "border-red-600": !isValidTokenInValue,
            })}
          >
            <EarnInput
              showMaxButton={!!account}
              assetPickerRenderer={assetPickerRenderer}
              placeholder="0.00"
              value={amountIn || ""}
              isValid={isValidTokenInValue}
              errorMessage={tokenInError}
              onValueChange={onChangeIn}
              valueDecimals={activeBaseAssetDecimals}
              valueBalanceOf={activeBaseAssetBalanceOf}
              swapKind={SwapKind.GIVEN_IN}
            />
          </div>
        </div>
        <div className={tw("flex", "flex-col", "space-y-2")}>
          <div className={tw("flex", "justify-between")}>
            <span
              className={classNames(tw("text-base"), Classes.TEXT_MUTED)}
            >{t`To`}</span>
            {marketRateLabel && (
              <span className={classNames(tw("text-base"), Classes.TEXT_MUTED)}>
                {marketRateLabel}
              </span>
            )}
          </div>
          <div
            className={tw("flex", "space-x-1", "h-24", "border", "rounded", {
              "border-gray-500": isValidTokenOutValue,
              "border-red-600": !isValidTokenOutValue,
            })}
          >
            <EarnInput
              showMaxButton={false}
              assetPickerRenderer={termPickerRenderer}
              placeholder="0.00"
              value={amountOut || ""}
              isValid={isValidTokenOutValue}
              errorMessage={tokenOutError}
              onValueChange={onChangeOut}
              valueDecimals={principalTokenDecimals}
              valueBalanceOf={principalTokenBalanceOf}
              swapKind={SwapKind.GIVEN_OUT}
            />
          </div>
        </div>

        <div className={tw("flex", "space-x-10", "h-24", "mt-10")}>
          <PrincipalDiscountPreview
            amountIn={amountIn}
            baseAssetSymbol={activeBaseAssetSymbol}
            amountOut={amountOut}
          />
          <Button
            large
            outlined
            intent={Intent.PRIMARY}
            className={tw("flex-1")}
            disabled={buttonDisabled}
            onClick={onClickButton}
          >
            <div className={tw("p-4", "text-lg")}>{buttonLabel}</div>
          </Button>
        </div>
      </Card>

      {!activeBaseAsset || !isDrawerOpen ? null : (
        <BuyPrincipalTokensTransactionConfirmationDrawer
          baseAsset={activeBaseAsset}
          baseAssetIcon={baseAssetIcon}
          tranche={activeTranche}
          account={account}
          library={library}
          pool={poolContract}
          amountIn={amountIn}
          isOpen={isDrawerOpen}
          onClose={closeDrawer}
        />
      )}
      <ConnectWalletDialog
        isOpen={isWalletDialogOpen}
        onClose={closeWalletDialog}
      />
    </Fragment>
  );
}

function useActiveBaseAsset(onChange: (baseAsset: CryptoAsset) => void) {
  const [activeBaseAsset, setActiveBaseAssetState] = useState<CryptoAsset>(
    openTrancheBaseAssets[0]
  );

  const setActiveBaseAsset = useCallback(
    (baseAsset: CryptoAsset) => {
      onChange(baseAsset);
      setActiveBaseAssetState(baseAsset);
    },
    [onChange]
  );
  return { activeBaseAsset, setActiveBaseAsset };
}
function getMarketRateLabel(
  inputTokenSymbol: string | undefined,
  roundedTranchePrice: string | undefined,
  activeBaseAssetSymbol: string | undefined
): string | undefined {
  if (!inputTokenSymbol || !roundedTranchePrice || !activeBaseAssetSymbol) {
    return;
  }
  return t`1 ${inputTokenSymbol} Principal Token ≈ ${roundedTranchePrice} ${activeBaseAssetSymbol}`;
}
