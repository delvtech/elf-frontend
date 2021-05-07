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
import { getQueryData } from "efi-ui/base/queryResults";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { findAssetIcon } from "efi-ui/crypto/CryptoIcon";
import { useCryptoAssetForToken } from "efi-ui/crypto/hooks/useCryptoAssetForToken";
import { useCryptoBalance } from "efi-ui/crypto/hooks/useCryptoBalance/useCryptoBalance";
import { useCryptoSymbol } from "efi-ui/crypto/hooks/useCryptoSymbol/useCryptoSymbol";
import { usePoolSpotPrice } from "efi-ui/pools/usePoolSpotPrice/usePoolSpotPrice";
import { usePoolTokens } from "efi-ui/pools/usePoolTokens/usePoolTokens";
import { useTokenPoolBalance } from "efi-ui/pools/useTokenPoolBalance/useTokenPoolBalance";
import { useTokenPoolIndex } from "efi-ui/pools/useTokenPoolIndex/useTokenPoolIndex";
import { SwapTokensTransactionConfirmationDrawer } from "efi-ui/swaps/SwapTokensTransactionConfirmationDrawer/SwapTokensTransactionConfirmationDrawer";
import { useTokenDecimals } from "efi-ui/token/hooks/useTokenDecimals";
import { TradeInput } from "efi-ui/trade/TradeInput/TradeInput";
import { useTermAssetSymbol } from "efi-ui/tranche/useTermAssetSymbol";
import { BALANCER_ETH_SENTINEL } from "efi/balancer";
import { formatBalance } from "efi/base/formatBalance";
import { ContractMethodArgs } from "efi/contracts/types";
import { CryptoAssetType } from "efi/crypto/CryptoAsset";
import { parseSortedTokensForPool } from "efi/pools/parseSortedTokensForPool";
import { PoolContract } from "efi/pools/PoolContract";
import { validateTradeValues } from "efi/trade/validateTradeValues";
import { useBaseAssetForPool } from "efi-ui/pools/useBaseAssetForPool/useBaseAssetForPool";
import { getVaultSymbol } from "efi/vaults/getVaultSymbol";

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
    pool,
    tokenIn: tokenInFromProps,
    tokenOut: tokenOutFromProps,
  } = props;

  const { tokenIn, tokenOut, swapAssets, isReversed } = useReversableTokens(
    tokenInFromProps,
    tokenOutFromProps
  );

  const baseAsset = useBaseAssetForPool(pool);
  const spotPrice = usePoolSpotPrice(pool, baseAsset);

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
    onChangeIn("");
    onChangeOut("");
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

  const insufficientBalance = parseUnits(amountIn ?? "0", tokenInDecimals).gt(
    tokenInBalanceOf ?? 0
  );

  const insufficientPoolBalance =
    parseUnits(amountIn ?? "0", tokenInDecimals).gt(tokenInPoolBalance ?? 0) ||
    parseUnits(amountOut ?? "0", tokenOutDecimals).gt(tokenOutPoolBalance ?? 0);

  const submitButtonDisabled =
    formDisabled ||
    submitDisabled ||
    insufficientBalance ||
    insufficientPoolBalance ||
    !isValidTokenInValue ||
    !isValidTokenOutValue ||
    !amountIn ||
    !amountOut ||
    !account;

  let submitButtonLabel = buttonLabel;
  let submitButtonError = false;
  if (!amountIn && !amountOut) {
    submitButtonLabel = t`Enter an amount`;
  }
  if (insufficientBalance && account) {
    submitButtonError = true;
    submitButtonLabel = t`Insufficient balance`;
  }
  if (insufficientPoolBalance && account) {
    submitButtonError = true;
    submitButtonLabel = t`Insufficient pool liquidity`;
  }
  if (!account) {
    submitButtonLabel = t`Connect wallet`;
  }

  const onClose = useCallback(() => {
    setDrawerOpen(false);
    onChangeIn("");
    onChangeOut("");
  }, [onChangeIn, onChangeOut]);
  return (
    <div
      className={tw(
        "flex",
        "flex-col",
        "justify-around",
        "space-y-2",
        "h-full"
      )}
    >
      {/* Trade Asset */}
      <TradeInput
        cryptoAddress={tokenInAddress}
        cryptoDecimals={tokenInDecimals}
        cryptoBalanceOf={tokenInBalanceOf}
        cryptoDisplayBalance={tokenInDisplayBalance || ""}
        cryptoSymbol={tokenInSymbol}
        cryptoIcon={tokenInIcon}
        previewCryptoAddress={tokenOutAddress}
        previewCryptoPoolIndex={tokenOutPoolIndex}
        labelTopLeft={t`Trade`}
        disabled={formDisabled}
        swapKind={SwapKind.GIVEN_IN}
        pool={pool}
        onChange={onChangeIn}
        onPreviewUpdate={onChangeOut}
        value={amountIn}
        validValue={isValidTokenInValue}
      />
      <div className={tw("flex", "justify-center", "rounded-full")}>
        <Button
          icon={IconNames.ARROWS_VERTICAL}
          onClick={swapAssets}
          minimal
          outlined
          large
          intent={Intent.PRIMARY}
        ></Button>
      </div>
      <TradeInput
        cryptoAddress={tokenOutAddress}
        cryptoDecimals={tokenOutDecimals}
        cryptoBalanceOf={tokenOutBalanceOf}
        cryptoDisplayBalance={tokenOutDisplayBalance || ""}
        cryptoSymbol={tokenOutSymbol}
        cryptoIcon={tokenOutIcon}
        previewCryptoAddress={tokenInAddress}
        previewCryptoPoolIndex={tokenInPoolIndex}
        labelTopLeft={t`For (estimated)`}
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
        intent={submitButtonError ? Intent.DANGER : Intent.PRIMARY}
      >
        {submitButtonLabel}
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
        onClose={onClose}
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
  // getting the proper symbols is a pain using hooks.  all this logic is for that:
  // get contracts/assets
  const tokensResult = usePoolTokens(pool);
  const [tokens] = getQueryData(tokensResult) ?? [];
  const { termAssetContract, baseAssetContract } = parseSortedTokensForPool(
    tokens
  );
  const baseCryptoAsset = useCryptoAssetForToken(baseAssetContract?.address);

  // get symbols
  const baseAssetSymbol = useCryptoSymbol(baseCryptoAsset);
  const vaultSymbol = getVaultSymbol(baseCryptoAsset);
  const { symbol: termSymbol } = useTermAssetSymbol(
    termAssetContract?.address,
    vaultSymbol
  );

  // choose correct symbol
  const symbol =
    termAssetContract?.address === tokenContract?.address
      ? termSymbol
      : baseAssetSymbol;

  // get other properties
  const asset = useCryptoAssetForToken(tokenContract?.address);
  const address =
    asset?.type === CryptoAssetType.ETHEREUM
      ? BALANCER_ETH_SENTINEL
      : tokenContract?.address;
  const icon = findAssetIcon(baseAssetSymbol);
  const { data: decimals } = useTokenDecimals(tokenContract);
  const balanceOf = useCryptoBalance(library, account, asset);
  const displayBalance = formatBalance(balanceOf, decimals);
  const poolBalance = useTokenPoolBalance(pool, tokenContract);
  const poolIndex = useTokenPoolIndex(pool, tokenContract);

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
