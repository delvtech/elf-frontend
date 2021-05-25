import { ReactElement, useCallback, useEffect, useState } from "react";

import { Button, Intent } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Web3Provider } from "@ethersproject/providers";
import { AbstractConnector } from "@web3-react/abstract-connector";
import { ERC20 } from "elf-contracts/types/ERC20";
import { BigNumber, Signer } from "ethers";
import { formatEther, formatUnits, parseUnits } from "ethers/lib/utils";
import { PrincipalPoolTokenInfo, YieldPoolTokenInfo } from "tokenlists/types";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { SwapKind } from "efi-ui/balancer/SwapKind";
import { useNumericInput } from "efi-ui/base/hooks/useNumericInput/useNumericInput";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { findAssetIcon } from "efi-ui/crypto/CryptoIcon";
import { useCryptoBalance } from "efi-ui/crypto/hooks/useCryptoBalance/useCryptoBalance";
import { useBaseAssetForPool } from "efi-ui/pools/useBaseAssetForPool/useBaseAssetForPool";
import { usePoolSpotPrice } from "efi-ui/pools/usePoolSpotPrice/usePoolSpotPrice";
import { useTokenPoolBalance } from "efi-ui/pools/useTokenPoolBalance/useTokenPoolBalance";
import { useTokenPoolIndex } from "efi-ui/pools/useTokenPoolIndex/useTokenPoolIndex";
import { SwapTokensTransactionConfirmationDrawer } from "efi-ui/swaps/SwapTokensTransactionConfirmationDrawer/SwapTokensTransactionConfirmationDrawer";
import { useTokenDecimals } from "efi-ui/token/hooks/useTokenDecimals";
import { TradeInput } from "efi-ui/trade/TradeInput/TradeInput";
import { ConnectWalletDialog } from "efi-ui/wallets/ConnectWalletDialog/ConnectWalletDialog";
import { BALANCER_ETH_SENTINEL } from "efi/balancer";
import { formatBalance } from "efi/base/formatBalance";
import { ContractMethodArgs } from "efi/contracts/types";
import { CryptoAssetType } from "efi/crypto/CryptoAsset";
import { getCryptoAssetForToken } from "efi/crypto/getCryptoAssetForToken";
import { getCryptoSymbol } from "efi/crypto/getCryptoSymbol";
import { clipStringValueToDecimals } from "efi/math/fixedPoint";
import {
  calcSwapInGivenOutCCPoolUNSAFE,
  calcSwapOutGivenInCCPoolUNSAFE,
} from "efi/pools/calcPoolSwap";
import { getPrincipalPoolForTranche } from "efi/pools/ccpool";
import { getPoolTokenInfoFromContract } from "efi/pools/getPoolInfo";
import { getTrancheForPool } from "efi/pools/getTrancheForPool";
import { PoolContract } from "efi/pools/PoolContract";
import { PoolInfo } from "efi/pools/PoolInfo";
import { validateTradeValues } from "efi/trade/validateTradeValues";
import { getTermAssetSymbol } from "efi/tranche/getTermAssetSymbol";
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
  const [swapKind, setSwapKind] = useState(SwapKind.GIVEN_IN);
  const [isWalletDialogOpen, setWalletDialogOpen] = useState(false);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const onClickButton = useCallback(() => {
    if (!account) {
      return setWalletDialogOpen(true);
    }
    openDrawer();
  }, [account, openDrawer]);

  const { tokenIn, tokenOut, swapAssets, isReversed } = useReversableTokens(
    tokenInFromProps,
    tokenOutFromProps
  );

  const { stringValue: amountIn, setValue: setAmountIn } = useNumericInput();
  const { stringValue: amountOut, setValue: setAmountOut } = useNumericInput();

  const clearInputs = useCallback(() => {
    setAmountIn("");
    setAmountOut("");
  }, [setAmountIn, setAmountOut]);

  // clear inputs when they switch.  we can improve this UX later to keep the previous values.
  useEffect(() => {
    clearInputs();
  }, [clearInputs, isReversed]);

  const onClose = useCallback(() => {
    setDrawerOpen(false);
    setAmountIn("");
    setAmountOut("");
  }, [setAmountIn, setAmountOut]);

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

  const { isValidTokenInValue, isValidTokenOutValue } = validateTradeValues(
    amountIn,
    amountOut,
    tokenInPoolBalance,
    tokenOutPoolBalance,
    tokenInBalanceOf,
    tokenInDecimals
  );

  const insufficientBalance = parseUnits(amountIn || "0", tokenInDecimals).gt(
    tokenInBalanceOf ?? 0
  );

  const insufficientPoolBalance = parseUnits(
    amountOut || "0",
    tokenOutDecimals
  ).gt(tokenOutPoolBalance ?? 0);

  const invalidInput =
    formDisabled ||
    submitDisabled ||
    insufficientBalance ||
    insufficientPoolBalance ||
    !isValidTokenInValue ||
    !isValidTokenOutValue ||
    !amountIn ||
    !amountOut;
  const submitButtonDisabled = !!account && invalidInput;

  const { submitButtonError, submitButtonLabel } = getSubmitButtonLabel(
    buttonLabel,
    amountIn,
    amountOut,
    insufficientBalance,
    account,
    insufficientPoolBalance
  );

  // pool
  const poolInfo = getPoolTokenInfoFromContract(pool);
  const trancheInfo = getTrancheForPool(poolInfo as PoolInfo);
  // pool
  const {
    extensions: { expiration, unitSeconds },
  } = getPrincipalPoolForTranche(trancheInfo.address);

  // TODO: use a global Date.now that updates at a constant interval
  const nowInSeconds = Math.round(Date.now() / 1000);
  const timeRemainingSeconds = expiration - nowInSeconds;
  const tParamSeconds = unitSeconds;

  const { data: totalSupplyBN } = useSmartContractReadCall(pool, "totalSupply");
  const totalSupply = formatEther(totalSupplyBN ?? 0);

  const onChangeIn = useOnChangeIn(
    clearInputs,
    tokenInBalanceOf,
    tokenInDecimals,
    tokenOutBalanceOf,
    totalSupply,
    timeRemainingSeconds,
    tParamSeconds,
    setSwapKind,
    setAmountIn,
    setAmountOut
  );

  const onChangeOut = useOnChangeOut(
    clearInputs,
    tokenOutBalanceOf,
    tokenInDecimals,
    tokenInBalanceOf,
    totalSupply,
    timeRemainingSeconds,
    tParamSeconds,
    tokenOutDecimals,
    setSwapKind,
    setAmountIn,
    setAmountOut
  );

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
        labelTopLeft={
          swapKind === SwapKind.GIVEN_IN ? t`Trade` : t`Trade (estimated)`
        }
        disabled={formDisabled}
        swapKind={SwapKind.GIVEN_IN}
        pool={pool}
        onChange={onChangeIn}
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
        labelTopLeft={
          swapKind === SwapKind.GIVEN_OUT ? t`For` : t`For (estimated)`
        }
        disabled={formDisabled}
        swapKind={SwapKind.GIVEN_OUT}
        pool={pool}
        onChange={onChangeOut}
        value={amountOut}
        validValue={isValidTokenOutValue}
      />
      <Button
        disabled={submitButtonDisabled}
        onClick={onClickButton}
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
        amountOut={amountOut}
        swapKind={swapKind}
        spotPrice={spotPrice}
        isOpen={isDrawerOpen}
        onClose={onClose}
      />
      <ConnectWalletDialog
        isOpen={isWalletDialogOpen}
        onClose={() => setWalletDialogOpen(false)}
      />
    </div>
  );
}

function useOnChangeOut(
  clearInputs: () => void,
  tokenOutBalanceOf: BigNumber | undefined,
  tokenInDecimals: number | undefined,
  tokenInBalanceOf: BigNumber | undefined,
  totalSupply: string,
  timeRemainingSeconds: number,
  tParamSeconds: number,
  tokenOutDecimals: number | undefined,
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
      const newAmountInNumber = calcSwapInGivenOutCCPoolUNSAFE(
        newAmountOut,
        formatUnits(tokenOutBalanceOf ?? 0, tokenInDecimals),
        formatUnits(tokenInBalanceOf ?? 0, tokenInDecimals),
        totalSupply,
        timeRemainingSeconds,
        tParamSeconds,
        false
      );
      const newAmountIn = clipStringValueToDecimals(
        newAmountInNumber.toString(),
        tokenOutDecimals ?? 18
      );
      setSwapKind(swapKind);
      setAmountIn(newAmountIn);
      setAmountOut(newAmountOut);
    },
    [
      clearInputs,
      setAmountIn,
      setAmountOut,
      setSwapKind,
      tParamSeconds,
      timeRemainingSeconds,
      tokenInBalanceOf,
      tokenInDecimals,
      tokenOutBalanceOf,
      tokenOutDecimals,
      totalSupply,
    ]
  );
}

function useOnChangeIn(
  clearInputs: () => void,
  tokenInBalanceOf: BigNumber | undefined,
  tokenInDecimals: number | undefined,
  tokenOutBalanceOf: BigNumber | undefined,
  totalSupply: string,
  timeRemainingSeconds: number,
  tParamSeconds: number,
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
      const newAmountOutNumber = calcSwapOutGivenInCCPoolUNSAFE(
        newAmountIn,
        formatUnits(tokenInBalanceOf ?? 0, tokenInDecimals),
        formatUnits(tokenOutBalanceOf ?? 0, tokenInDecimals),
        totalSupply,
        timeRemainingSeconds,
        tParamSeconds,
        true
      );
      const newAmountOut = clipStringValueToDecimals(
        newAmountOutNumber.toString(),
        tokenInDecimals ?? 18
      );

      setSwapKind(swapKind);
      setAmountIn(newAmountIn);
      setAmountOut(newAmountOut);
    },
    [
      clearInputs,
      setAmountIn,
      setAmountOut,
      setSwapKind,
      tParamSeconds,
      timeRemainingSeconds,
      tokenInBalanceOf,
      tokenInDecimals,
      tokenOutBalanceOf,
      totalSupply,
    ]
  );
}

function getSubmitButtonLabel(
  buttonLabel: string,
  amountIn: string,
  amountOut: string,
  insufficientBalance: boolean,
  account: string | null | undefined,
  insufficientPoolBalance: boolean
) {
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
  return { submitButtonError, submitButtonLabel };
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
  const poolInfo = getPoolTokenInfoFromContract(pool) as
    | PrincipalPoolTokenInfo
    | YieldPoolTokenInfo;
  const baseAssetAddress = poolInfo?.extensions.underlying;
  const termAssetAddress =
    (poolInfo as PrincipalPoolTokenInfo)?.extensions?.bond ??
    (poolInfo as YieldPoolTokenInfo)?.extensions?.interestToken;
  const baseCryptoAsset = getCryptoAssetForToken(baseAssetAddress);

  // get symbols
  const baseAssetSymbol = getCryptoSymbol(baseCryptoAsset);
  const vaultSymbol = getVaultSymbol(baseCryptoAsset);
  const { symbol: termSymbol } = getTermAssetSymbol(
    termAssetAddress,
    vaultSymbol
  );

  // choose correct symbol
  const symbol =
    termAssetAddress === tokenContract?.address ? termSymbol : baseAssetSymbol;

  // get other properties
  const asset = getCryptoAssetForToken(tokenContract?.address);
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
