import {
  Fragment,
  ReactElement,
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Button,
  Callout,
  Card,
  Classes,
  Elevation,
  Intent,
} from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import classNames from "classnames";
import { ERC20 } from "elf-contracts-typechain/dist/types";
import { formatEther, formatUnits } from "ethers/lib/utils";
import { PrincipalPoolTokenInfo, PrincipalTokenInfo } from "tokenlists/types";
import { t } from "ttag";

import { SwapKind } from "efi-balancer/SwapKind";
import tw from "efi-tailwindcss-classnames";
import { getCalcSwap } from "efi-ui/balancer/useQueryBatchSwap/useQueryBatchSwap";
import { useNumericInput } from "efi-ui/base/hooks/useNumericInput/useNumericInput";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { CryptoAssetPicker } from "efi-ui/crypto/CryptoAssetPicker/CryptoAssetPicker";
import { useCryptoBalanceOf } from "efi-ui/crypto/hooks/useCryptoBalance/useCryptoBalance";
import { useCanPerformPool } from "efi-ui/pools/hooks/usePoolCanPerform/usePoolCanPerform";
import { usePoolSpotPrice } from "efi-ui/pools/hooks/usePoolSpotPrice/usePoolSpotPrice";
import { usePoolTokenPrices } from "efi-ui/pools/hooks/usePoolTokenPrices/usePoolTokenPrices";
import { usePoolTokens } from "efi-ui/pools/hooks/usePoolTokens/usePoolTokens";
import { useActiveTranche } from "efi-ui/saveApp/save/hooks/useActiveTranche";
import { PrincipalDiscountPreview } from "efi-ui/saveApp/save/SaveCard/PrincipalDiscountPreview";
import { SaveInput } from "efi-ui/saveApp/save/SaveInput/SaveInput";
import { SaveTermPicker } from "efi-ui/saveApp/save/SaveTermPicker/SaveTermPicker";
import { SwapTokensTransactionConfirmationDrawer } from "efi-ui/swaps/SwapTokensTransactionConfirmationDrawer/SwapTokensTransactionConfirmationDrawer";
import { useTokenBalanceOf } from "efi-ui/token/hooks/useTokenBalanceOf";
import { ConnectWalletDialog } from "efi-ui/wallets/ConnectWalletDialog/ConnectWalletDialog";
import { BALANCER_ETH_SENTINEL } from "efi/balancer";
import { formatBalance } from "efi/base/formatBalance";
import { clipStringValueToDecimals } from "efi/base/math/fixedPoint";
import { CryptoAsset, CryptoAssetType } from "efi/crypto/CryptoAsset";
import { getCryptoDecimals } from "efi/crypto/getCryptoDecimals";
import { getCryptoSymbol } from "efi/crypto/getCryptoSymbol";
import {
  getPoolInfoForPrincipalToken,
  getPrincipalPoolContractForTranche,
} from "efi/pools/ccpool";
import { getPoolTokens } from "efi/pools/getPoolTokens";
import { getTokenInfo } from "efi/tokenlists";
import { validateTradeValues } from "efi/trade/validateTradeValues";
import { underlyingContractsByAddress } from "efi/underlying/underlying";
import { useOpenTrancheBaseAssets } from "efi-ui/tranche/useOpenTrancheBaseAssets";
import { useBoolean } from "efi-ui/base/hooks/useBoolean/useBoolean";

export interface SaveCardProps {
  library: Web3Provider | undefined;
  account: string | null | undefined;
}

export function SaveCard({ library, account }: SaveCardProps): ReactElement {
  // local state
  const [swapKind, setSwapKind] = useState(SwapKind.GIVEN_IN);
  const {
    value: isWalletDialogOpen,
    setTrue: openWalletDialog,
    setFalse: closeWalletDialog,
  } = useBoolean(false);
  const {
    value: isDrawerOpen,
    setTrue: openDrawer,
    setFalse: setDrawerClosed,
  } = useBoolean(false);

  // handlers
  const onClickButton = useCallback(() => {
    if (!account) {
      return openWalletDialog();
    }
    openDrawer();
  }, [account, openDrawer, openWalletDialog]);

  const { stringValue: amountIn, setValue: setAmountIn } = useNumericInput();
  const { stringValue: amountOut, setValue: setAmountOut } = useNumericInput();
  const clearInputs = useCallback(() => {
    setAmountIn("");
    setAmountOut("");
  }, [setAmountIn, setAmountOut]);
  const closeDrawer = useCallback(() => {
    clearInputs();
    setDrawerClosed();
  }, [clearInputs, setDrawerClosed]);

  // base asset
  const { activeBaseAsset, setActiveBaseAsset } =
    useActiveBaseAsset(clearInputs);
  const baseAssetAddress =
    activeBaseAsset.type === CryptoAssetType.ETHEREUM
      ? BALANCER_ETH_SENTINEL
      : activeBaseAsset.tokenContract.address;
  const activeBaseAssetSymbol = getCryptoSymbol(activeBaseAsset);
  const activeBaseAssetDecimals = getCryptoDecimals(activeBaseAsset);
  const activeBaseAssetBalanceOf = useCryptoBalanceOf(
    library,
    account,
    activeBaseAsset
  );
  const activeBaseAssetDisplayBalance = formatBalance(
    activeBaseAssetBalanceOf,
    activeBaseAssetDecimals
  );
  const baseAssetSymbol = getCryptoSymbol(activeBaseAsset);
  const openTrancheBaseAssets = useOpenTrancheBaseAssets();

  // principal token
  const {
    activeTrancheIndex,
    activeTranche,
    availableTranches,
    setActiveTranche,
  } = useActiveTranche(activeBaseAsset);
  const {
    decimals: principalTokenDecimals,
    symbol: principalTokenSymbol,
    address: principalTokenAddress,
  } = getTokenInfo<PrincipalTokenInfo>(activeTranche.address);

  const { data: principalTokenBalanceOf } = useTokenBalanceOf(
    activeTranche,
    account
  );

  // pool
  const poolContract = getPrincipalPoolContractForTranche(
    activeTranche.address
  );
  const poolInfo = getPoolInfoForPrincipalToken(activeTranche.address);
  const {
    address: convergentPoolAddress,
    extensions: { underlying },
  } = poolInfo;
  const { baseAssetIndex, termAssetIndex: principalTokenIndex } =
    getPoolTokens(poolInfo);
  const { data: [, balances = []] = [] } = usePoolTokens(poolContract);

  const canPerformBuy = useCanPerformPool(convergentPoolAddress, "buy");

  const { data: totalSupplyBN } = useSmartContractReadCall(
    poolContract,
    "totalSupply"
  );

  const totalSupply = formatEther(totalSupplyBN ?? 0);
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

  const underlyingPoolTokenContract = underlyingContractsByAddress[
    underlying
  ] as ERC20;

  const { spotPriceBaseAssetForOneToken: amountOfEthForOnePrincipalEth } =
    usePoolTokenPrices(poolContract, underlyingPoolTokenContract);

  const spotPriceToken = usePoolSpotPrice(poolContract, principalTokenAddress);

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

  const onChangeIn = useOnChangeIn(
    clearInputs,
    poolInfo,
    baseAssetAddress,
    principalTokenAddress,
    baseReserves,
    principalReserves,
    totalSupply,
    activeBaseAssetDecimals,
    setSwapKind,
    setAmountIn,
    setAmountOut
  );

  const onChangeOut = useOnChangeOut(
    clearInputs,
    poolInfo,
    baseAssetAddress,
    principalTokenAddress,
    baseReserves,
    principalReserves,
    totalSupply,
    activeBaseAssetDecimals,
    setSwapKind,
    setAmountIn,
    setAmountOut
  );

  // need to recalculate output when a new term is selected.
  useEffect(() => {
    if (swapKind === SwapKind.GIVEN_IN) {
      onChangeIn(amountIn ?? "", SwapKind.GIVEN_IN);
    }
    if (swapKind === SwapKind.GIVEN_OUT) {
      onChangeOut(amountOut ?? "", SwapKind.GIVEN_OUT);
    }
  }, [activeTranche, amountIn, amountOut, onChangeIn, onChangeOut, swapKind]);

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
    noAmountIn ||
    !canPerformBuy;
  const buttonLabel = !!account ? t`Buy` : t`Connect Wallet`;

  const assetPickerRenderer = useCallback(
    () => (
      <CryptoAssetPicker
        cryptoAssets={openTrancheBaseAssets}
        activeCryptoAsset={activeBaseAsset}
        onCryptoAssetChange={setActiveBaseAsset}
      />
    ),
    [activeBaseAsset, openTrancheBaseAssets, setActiveBaseAsset]
  );

  const termPickerRenderer = useCallback(
    () => (
      <SaveTermPicker
        account={account}
        onTrancheChange={setActiveTranche}
        tranches={availableTranches}
        baseAsset={activeBaseAsset}
        activeTrancheIndex={activeTrancheIndex}
      />
    ),
    [
      account,
      activeBaseAsset,
      activeTrancheIndex,
      availableTranches,
      setActiveTranche,
    ]
  );

  return (
    <Fragment>
      <Card
        elevation={isDrawerOpen ? Elevation.ZERO : Elevation.TWO}
        className={tw("flex", "flex-col", "flex-1", "space-y-4")}
      >
        <div className={tw("flex", "flex-col", "space-y-2")}>
          <div className={tw("flex", "justify-between")}>
            <span className={classNames(Classes.TEXT_MUTED)}>{t`From`}</span>
            {!!account && (
              <span
                className={classNames(
                  Classes.TEXT_MUTED,
                  // Don't show the balance on small screens as per the design
                  tw("hidden", "lg:inline")
                )}
              >{t`Balance: ${activeBaseAssetDisplayBalance} ${activeBaseAssetSymbol}`}</span>
            )}
          </div>
          <div
            className={classNames(
              tw("flex", "lg:h-24", "border", "rounded", {
                "border-gray-500": isValidTokenInValue,
                "border-red-600": !isValidTokenInValue,
              })
            )}
          >
            <SaveInput
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
            <span className={classNames(Classes.TEXT_MUTED)}>{t`To`}</span>
            {marketRateLabel && (
              <span
                className={classNames(
                  Classes.TEXT_MUTED,
                  // Don't show the market rate on small screens as per the design
                  tw("hidden", "lg:inline")
                )}
              >
                {marketRateLabel}
              </span>
            )}
          </div>
          <div
            className={tw("flex", "lg:h-24", "border", "rounded", {
              "border-gray-500": isValidTokenOutValue,
              "border-red-600": !isValidTokenOutValue,
            })}
          >
            <SaveInput
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

        <div
          className={tw(
            "flex",
            "flex-col",
            "space-y-4",
            "lg:space-y-0",
            "lg:flex-row",
            "lg:space-x-10",
            "h-24",
            "mt-10"
          )}
        >
          <PrincipalDiscountPreview
            amountIn={amountIn}
            baseAssetSymbol={activeBaseAssetSymbol}
            amountOut={+principalReserves > +amountOut ? amountOut : undefined}
          />
          <Button
            large
            outlined
            intent={canPerformBuy ? Intent.PRIMARY : Intent.DANGER}
            className={tw("flex-1")}
            disabled={buttonDisabled}
            onClick={onClickButton}
          >
            <div className={tw("p-4", "text-lg")}>{buttonLabel}</div>
          </Button>
        </div>
        {!canPerformBuy ? (
          <Callout intent={Intent.DANGER}>
            {t`Trading for this token has been temporarily disabled, please refer to our Discord or Twitter for further updates.`}
          </Callout>
        ) : null}
      </Card>

      {!activeBaseAsset || !isDrawerOpen ? null : (
        <SwapTokensTransactionConfirmationDrawer
          tokenInAddress={baseAssetAddress}
          tokenInSymbol={baseAssetSymbol}
          tokenInDecimals={activeBaseAssetDecimals}
          tokenInAsset={activeBaseAsset}
          tokenInIcon={undefined}
          tokenOutAddress={principalTokenAddress}
          tokenOutSymbol={principalTokenSymbol}
          tokenOutDecimals={principalTokenDecimals}
          tokenOutIcon={undefined}
          account={account}
          library={library}
          poolInfo={poolInfo}
          amountIn={amountIn}
          amountOut={amountOut}
          swapKind={swapKind}
          spotPrice={spotPriceToken}
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

function useOnChangeOut(
  clearInputs: () => void,
  poolInfo: PrincipalPoolTokenInfo,
  baseAssetAddress: string,
  principalTokenAddress: string,
  baseReserves: string,
  principalReserves: string,
  totalSupply: string,
  activeBaseAssetDecimals: number,
  setSwapKind: (swapKind: SwapKind) => void,
  setAmountIn: (value: string) => void,
  setAmountOut: (value: string) => void
) {
  return useCallback(
    (newAmountOut: string, swapKind: SwapKind) => {
      if (!newAmountOut) {
        clearInputs();
        return;
      }
      const newAmountOutResult = getCalcSwap(
        newAmountOut,
        SwapKind.GIVEN_OUT,
        poolInfo,
        baseAssetAddress,
        principalTokenAddress,
        baseReserves,
        principalReserves,
        totalSupply
      );

      const { result: [amountIn] = ["", ""] } = newAmountOutResult;

      const newAmountIn = clipStringValueToDecimals(
        amountIn,
        activeBaseAssetDecimals ?? 18
      );
      setSwapKind(swapKind);
      setAmountIn(newAmountIn);
      setAmountOut(newAmountOut);
    },
    [
      activeBaseAssetDecimals,
      baseAssetAddress,
      baseReserves,
      clearInputs,
      poolInfo,
      principalReserves,
      principalTokenAddress,
      setAmountIn,
      setAmountOut,
      setSwapKind,
      totalSupply,
    ]
  );
}

function useOnChangeIn(
  clearInputs: () => void,
  poolInfo: PrincipalPoolTokenInfo,
  baseAssetAddress: string,
  principalTokenAddress: string,
  baseReserves: string,
  principalReserves: string,
  totalSupply: string,
  activeBaseAssetDecimals: number,
  setSwapKind: (swapKind: SwapKind) => void,
  setAmountIn: (value: string) => void,
  setAmountOut: (value: string) => void
) {
  return useCallback(
    (newAmountIn: string, swapKind: SwapKind) => {
      if (!newAmountIn) {
        clearInputs();
        return;
      }

      const newAmountOutResult = getCalcSwap(
        newAmountIn,
        SwapKind.GIVEN_IN,
        poolInfo,
        baseAssetAddress,
        principalTokenAddress,
        baseReserves,
        principalReserves,
        totalSupply
      );
      const { result: [, newAmountOutNumber] = ["", ""] } = newAmountOutResult;

      const newAmountOut = clipStringValueToDecimals(
        newAmountOutNumber,
        activeBaseAssetDecimals
      );
      setSwapKind(swapKind);
      setAmountIn(newAmountIn);
      setAmountOut(newAmountOut);
    },
    [
      activeBaseAssetDecimals,
      baseAssetAddress,
      baseReserves,
      clearInputs,
      poolInfo,
      principalReserves,
      principalTokenAddress,
      setAmountIn,
      setAmountOut,
      setSwapKind,
      totalSupply,
    ]
  );
}

function useActiveBaseAsset(onChange: (baseAsset: CryptoAsset) => void) {
  const openTrancheBaseAssets = useOpenTrancheBaseAssets();
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
