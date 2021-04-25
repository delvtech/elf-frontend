import { ReactElement, useCallback, useEffect, useState } from "react";

import { Button, Intent } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Web3Provider } from "@ethersproject/providers";
import { AbstractConnector } from "@web3-react/abstract-connector";
import { ERC20 } from "elf-contracts/types/ERC20";
import { BigNumber, Signer } from "ethers";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import {
  NumericInputOptions,
  useNumericInput,
} from "efi-ui/base/hooks/useNumericInput/useNumericInput";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { findAssetIcon } from "efi-ui/crypto/CryptoIcon";
import { useCryptoAssetForToken } from "efi-ui/crypto/hooks/useCryptoAssetForToken";
import { usePoolSpotPrice } from "efi-ui/pools/usePoolSpotPrice/usePoolSpotPrice";
import { useTokenPoolBalance } from "efi-ui/pools/useTokenPoolBalance/useTokenPoolBalance";
import { SwapTokensTransactionConfirmationDrawer } from "efi-ui/swaps/SwapTokensTransactionConfirmationDrawer/SwapTokensTransactionConfirmationDrawer";
import { useTokenBalanceOf } from "efi-ui/token/hooks/useTokenBalanceOf";
import { useTokenDecimals } from "efi-ui/token/hooks/useTokenDecimals";
import { useTokenSymbol } from "efi-ui/token/hooks/useTokenSymbol";
import { TradeInput } from "efi-ui/trade/TradeInput/TradeInput";
import { useEthBalance } from "efi-ui/wallets/hooks/useEthBalance/useEthBalance";
import { BALANCER_ETH_SENTINEL } from "efi/balancer";
import { formatBalance } from "efi/base/formatBalance";
import ContractAddresses from "efi/contracts/contractsJson";
import { ContractMethodArgs } from "efi/contracts/types";
import { CryptoSymbol } from "efi/crypto/CryptoSymbol";
import { PoolContract } from "efi/pools/PoolContract";
import { validateTradeValues } from "efi/trade/validateTradeValues";
import { SwapKind } from "efi-ui/balancer/SwapKind";
import { useTokenPoolIndex } from "efi-ui/pools/useTokenPoolIndex/useTokenPoolIndex";

interface TradePanelProps {
  library: Web3Provider | undefined;
  signer: Signer | undefined;
  account: string | null | undefined;
  chainId: number | undefined;
  connector: AbstractConnector | undefined;
  walletActive: boolean;
  pool: PoolContract | undefined;
  formDisabled?: boolean;
  submitDisabled?: boolean;
  inputLabel: string;
  buttonLabel: string;
  buttonIntent?: Intent;
  tokenIn: ERC20 | undefined;
  tokenOut: ERC20 | undefined;
}

export function TradePanel(props: TradePanelProps): ReactElement {
  const {
    account,
    library,
    chainId,
    connector,
    buttonLabel,
    walletActive,
    formDisabled = false,
    submitDisabled = false,
    inputLabel,
    buttonIntent = Intent.PRIMARY,
    pool,
    tokenIn: tokenInFromProps,
    tokenOut: tokenOutFromProps,
  } = props;

  const { tokenIn, tokenOut, swapAssets, isReversed } = useReversableTokens(
    tokenInFromProps,
    tokenOutFromProps
  );

  const spotPrice = usePoolSpotPrice(pool, tokenIn);

  const {
    asset: tokenInAsset,
    address: tokenInAddress,
    icon: tokenInIcon,
    symbol: tokenInSymbol,
    decimals: tokenInDecimals,
    balanceOf: tokenInBalanceOf,
    displayBalance: tokenInDisplayBalance,
    poolBalance: tokenInPoolBalance,
    poolIndex: tokenInPoolIndex,
  } = useTokenInfoForTradeInput(pool, tokenIn, account, library);

  const {
    address: tokenOutAddress,
    icon: tokenOutIcon,
    symbol: tokenOutSymbol,
    decimals: tokenOutDecimals,
    displayBalance: tokenOutDisplayBalance,
    poolBalance: tokenOutPoolBalance,
    poolIndex: tokenOutPoolIndex,
  } = useTokenInfoForTradeInput(pool, tokenOut, account, library);

  const {
    amountIn,
    amountOut,
    onChangeIn,
    onChangeOut,
    onChangeInFromOut,
    onChangeOutFromIn,
    setValueIn,
    setValueOut,
  } = useUpdateInputs();

  // clear inputs when they switch.  we can improve this UX later to keep the previous values.
  useEffect(() => {
    setValueIn(undefined);
    setValueOut(undefined);
    // don't want to call this effect when the hooks update, only when isReversed updates
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReversed]);

  const { isValidTokenInValue, isValidTokenOutValue } = validateTradeValues(
    amountIn,
    tokenInBalanceOf,
    tokenInDecimals,
    tokenInPoolBalance,
    amountOut,
    tokenOutPoolBalance
  );

  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const submitTransaction = useCallback(() => {
    setDrawerOpen(true);
  }, []);

  const setMaxValue = useSetMaxValue(
    tokenInBalanceOf,
    setValueIn,
    tokenInDecimals
  );

  const submitButtonDisabled =
    formDisabled ||
    submitDisabled ||
    !isValidTokenInValue ||
    !isValidTokenOutValue ||
    !amountIn ||
    !amountOut;

  return (
    <div className={tw("flex", "flex-col", "space-y-5")}>
      {/* Trade Asset */}
      <div className={tw("flex", "justify-between", "items-center")}>
        <span>{inputLabel}</span>
        <Button
          disabled={formDisabled}
          onClick={setMaxValue}
          minimal
          outlined
          small
          intent={Intent.SUCCESS}
        >{t`MAX`}</Button>
      </div>
      <TradeInput
        cryptoAddress={tokenInAddress}
        cryptoDecimals={tokenInDecimals}
        cryptoDisplayBalance={tokenInDisplayBalance || ""}
        cryptoSymbol={tokenInSymbol as CryptoSymbol}
        otherCryptoAddress={tokenOutAddress}
        otherCryptoIndex={tokenOutPoolIndex}
        disabled={formDisabled}
        swapKind={SwapKind.GIVEN_IN}
        pool={pool}
        onChangeThisValue={onChangeIn}
        onChangeOtherValue={onChangeOutFromIn}
        value={amountIn}
        validValue={isValidTokenInValue}
      />

      <Button
        icon={IconNames.ARROWS_VERTICAL}
        onClick={swapAssets}
        minimal
        large
        intent={buttonIntent}
      ></Button>

      {/* Receive Asset */}
      <div className={tw("flex", "justify-between", "items-center")}>
        <span>{t`For`}</span>
      </div>
      <TradeInput
        cryptoAddress={tokenOutAddress}
        cryptoDecimals={tokenOutDecimals}
        cryptoDisplayBalance={tokenOutDisplayBalance || ""}
        cryptoSymbol={tokenOutSymbol as CryptoSymbol}
        otherCryptoAddress={tokenInAddress}
        otherCryptoIndex={tokenInPoolIndex}
        disabled={formDisabled}
        swapKind={SwapKind.GIVEN_OUT}
        pool={pool}
        onChangeThisValue={onChangeOut}
        onChangeOtherValue={onChangeInFromOut}
        value={amountOut}
        validValue={isValidTokenOutValue}
      />
      <Button
        disabled={submitButtonDisabled}
        onClick={submitTransaction}
        minimal
        outlined
        large
        intent={buttonIntent}
      >
        {buttonLabel}
      </Button>
      <SwapTokensTransactionConfirmationDrawer
        tokenInAddress={tokenInAddress}
        tokenInSymbol={tokenInSymbol}
        tokenInDecimals={tokenInDecimals}
        tokenInAsset={tokenInAsset}
        tokenInIcon={tokenInIcon}
        tokenOutAddress={tokenOutAddress}
        tokenOutSymbol={tokenOutSymbol}
        tokenOutDecimals={tokenOutDecimals}
        tokenOutIcon={tokenOutIcon}
        account={account}
        library={library}
        chainId={chainId}
        connector={connector}
        pool={pool}
        walletConnectionActive={walletActive}
        amountIn={amountIn}
        spotPrice={spotPrice}
        isOpen={isDrawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}

function useSetMaxValue(
  tokenInBalanceOf: BigNumber | undefined,
  setValueIn: (value: string) => void,
  tokenInDecimals: number | undefined
) {
  return useCallback(() => {
    if (tokenInBalanceOf) {
      setValueIn(formatUnits(tokenInBalanceOf, tokenInDecimals));
    }
  }, [tokenInBalanceOf, setValueIn, tokenInDecimals]);
}

function useReversableTokens(
  tokenInFromProps: ERC20 | undefined,
  tokenOutFromProps: ERC20 | undefined
) {
  const [isReversed, setReversed] = useState(false);
  const swapAssets = useCallback(() => {
    setReversed(!isReversed);
  }, [isReversed]);

  let tokenIn = tokenInFromProps;
  let tokenOut = tokenOutFromProps;
  if (isReversed) {
    tokenIn = tokenOutFromProps;
    tokenOut = tokenInFromProps;
  }
  return { tokenIn, tokenOut, swapAssets, isReversed };
}

// TODO: clean this up, I don't know what we need amountOut in here
export function useTokenApproval(
  account: string | null | undefined,
  pool: PoolContract | undefined,
  tokenIn: ERC20 | undefined,
  amountIn: string | undefined,
  tokenInDecimals: number | undefined
): boolean {
  // safe to cast callArgs since we don't enable the call unless they are defnied
  const callArgs: ContractMethodArgs<ERC20, "allowance"> = [
    account as string,
    pool?.address as string,
  ];
  const { data: allowance } = useSmartContractReadCall(tokenIn, "allowance", {
    callArgs,
    enabled: !!pool?.address && !!account,
  });
  const approved =
    amountIn && allowance
      ? allowance.gte(parseUnits(amountIn || "0", tokenInDecimals))
      : false;
  return approved;
}

function useTokenInfoForTradeInput(
  pool: PoolContract | undefined,
  tokenContract: ERC20 | undefined,
  account: string | null | undefined,
  library: Web3Provider | undefined
) {
  const isWETH = tokenContract?.address === ContractAddresses.wethAddress;
  const { data: ethBalance } = useEthBalance(library, account);

  // otherwise get values from token calls
  const poolBalance = useTokenPoolBalance(pool, tokenContract);
  const poolIndex = useTokenPoolIndex(pool, tokenContract);
  const { data: symbol } = useTokenSymbol(tokenContract);
  const icon = findAssetIcon(symbol);
  const { data: decimals } = useTokenDecimals(tokenContract);
  const { data: tokenBalance } = useTokenBalanceOf(tokenContract, account);

  const balanceOf = isWETH ? ethBalance : tokenBalance;
  const displayBalance = formatBalance(balanceOf, decimals);
  const address = isWETH ? BALANCER_ETH_SENTINEL : tokenContract?.address;
  const asset = useCryptoAssetForToken(tokenContract?.address);
  return {
    asset,
    address,
    icon,
    symbol,
    decimals,
    balanceOf,
    displayBalance,
    poolBalance,
    poolIndex,
  };
}

const numericInputOptions: NumericInputOptions = {
  min: 0,
  /**
   * limit precision to prevent BigNumber overflows
   */
  maxPrecision: 18,
};

function useUpdateInputs() {
  // useNumericInput ensures valid numeric inputs from the user
  const { stringValue: stringValueIn, setValue: setValueIn } = useNumericInput(
    numericInputOptions
  );
  const {
    stringValue: stringValueOut,
    setValue: setValueOut,
  } = useNumericInput(numericInputOptions);

  const onChangeOutFromIn = useCallback(
    (otherNeeded: string | undefined) => {
      if (!otherNeeded || +otherNeeded === 0) {
        setValueOut(undefined);
      } else {
        setValueOut(otherNeeded);
      }
    },
    [setValueOut]
  );
  const onChangeInFromOut = useCallback(
    (otherNeeded: string | undefined) => {
      if (!otherNeeded) {
        setValueIn(undefined);
      } else {
        setValueIn(otherNeeded);
      }
    },
    [setValueIn]
  );
  return {
    amountIn: stringValueIn,
    amountOut: stringValueOut,
    onChangeIn: setValueIn,
    onChangeOut: setValueOut,
    onChangeOutFromIn,
    onChangeInFromOut,
    setValueIn,
    setValueOut,
  };
}
