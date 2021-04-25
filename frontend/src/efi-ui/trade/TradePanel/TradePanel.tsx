import { ReactElement, useCallback, useEffect, useState } from "react";

import { Button, Intent } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Web3Provider } from "@ethersproject/providers";
import { AbstractConnector } from "@web3-react/abstract-connector";
import { ERC20 } from "elf-contracts/types/ERC20";
import { Signer } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { SwapKind } from "efi-ui/balancer/SwapKind";
import { useNumericInput } from "efi-ui/base/hooks/useNumericInput/useNumericInput";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { findAssetIcon } from "efi-ui/crypto/CryptoIcon";
import { useCryptoAssetForToken } from "efi-ui/crypto/hooks/useCryptoAssetForToken";
import { usePoolSpotPrice } from "efi-ui/pools/usePoolSpotPrice/usePoolSpotPrice";
import { useTokenPoolBalance } from "efi-ui/pools/useTokenPoolBalance/useTokenPoolBalance";
import { useTokenPoolIndex } from "efi-ui/pools/useTokenPoolIndex/useTokenPoolIndex";
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
    balanceOf: tokenOutBalanceOf,
    displayBalance: tokenOutDisplayBalance,
    poolBalance: tokenOutPoolBalance,
    poolIndex: tokenOutPoolIndex,
  } = useTokenInfoForTradeInput(pool, tokenOut, account, library);

  const { stringValue: amountIn, setValue: onChangeIn } = useNumericInput();
  const { stringValue: amountOut, setValue: onChangeOut } = useNumericInput();

  // clear inputs when they switch.  we can improve this UX later to keep the previous values.
  useEffect(() => {
    onChangeIn(undefined);
    onChangeOut(undefined);
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

  const submitButtonDisabled =
    formDisabled ||
    submitDisabled ||
    !isValidTokenInValue ||
    !isValidTokenOutValue ||
    !amountIn ||
    !amountOut;

  return (
    <div className={tw("flex", "flex-col", "justify-between", "h-full")}>
      {/* Trade Asset */}
      <TradeInput
        cryptoAddress={tokenInAddress}
        cryptoDecimals={tokenInDecimals}
        cryptoBalanceOf={tokenInBalanceOf}
        cryptoDisplayBalance={tokenInDisplayBalance || ""}
        cryptoSymbol={tokenInSymbol as CryptoSymbol}
        previewCryptoAddress={tokenOutAddress}
        previewCryptoPoolIndex={tokenOutPoolIndex}
        label={t`Swap`}
        disabled={formDisabled}
        swapKind={SwapKind.GIVEN_IN}
        pool={pool}
        onChange={onChangeIn}
        onPreviewUpdate={onChangeOut}
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
      <TradeInput
        cryptoAddress={tokenOutAddress}
        cryptoDecimals={tokenOutDecimals}
        cryptoBalanceOf={tokenOutBalanceOf}
        cryptoDisplayBalance={tokenOutDisplayBalance || ""}
        cryptoSymbol={tokenOutSymbol as CryptoSymbol}
        previewCryptoAddress={tokenInAddress}
        previewCryptoPoolIndex={tokenInPoolIndex}
        label={t`For`}
        disabled={formDisabled}
        swapKind={SwapKind.GIVEN_OUT}
        pool={pool}
        onChange={onChangeOut}
        onPreviewUpdate={onChangeIn}
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
