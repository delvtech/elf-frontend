import { ReactElement, useCallback, useState } from "react";

import { Button, Intent } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { AbstractConnector } from "@web3-react/abstract-connector";
import { ERC20 } from "elf-contracts/types/ERC20";
import { BigNumber, Signer } from "ethers";
import { formatEther, formatUnits, parseUnits } from "ethers/lib/utils";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import {
  NumericInputOptions,
  useNumericInput,
} from "efi-ui/base/hooks/useNumericInput/useNumericInput";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { findAssetIcon } from "efi-ui/crypto/CryptoIcon";
import { useCryptoAssetForToken } from "efi-ui/crypto/hooks/useCryptoAssetForToken";
import { StakingConfirmationDrawer } from "efi-ui/pools/StakeTokensConfirmationDrawer/StakeTokensConfirmationDrawer";
import { StakingInput } from "efi-ui/pools/StakingInput/StakingInput";
import { usePoolTokens } from "efi-ui/pools/usePoolTokens/usePoolTokens";
import { useTokenPoolBalance } from "efi-ui/pools/useTokenPoolBalance/useTokenPoolBalance";
import { useTokenBalanceOf } from "efi-ui/token/hooks/useTokenBalanceOf";
import { useTokenDecimals } from "efi-ui/token/hooks/useTokenDecimals";
import { useTokenSymbol } from "efi-ui/token/hooks/useTokenSymbol";
import { useTrancheAssetSymbol } from "efi-ui/tranche/useTrancheAssetSymbol";
import { useEthBalance } from "efi-ui/wallets/hooks/useEthBalance/useEthBalance";
import { BALANCER_ETH_SENTINEL } from "efi/balancer";
import { formatBalance } from "efi/base/formatBalance";
import ContractAddresses from "efi/contracts/contractsJson";
import { ContractMethodArgs } from "efi/contracts/types";
import { CryptoSymbol } from "efi/crypto/CryptoSymbol";
import { parseSortedTokensForPool } from "efi/pools/parseSortedTokensForPool";
import { PoolContract } from "efi/pools/PoolContract";
import { validateStakingValue } from "efi/staking/validateStakeValue";
import { useJoinConvergentPool } from "efi-ui/pools/useJoinConvergentPool/useJoinConvergentPool";

interface StakingPanelProps {
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
  onTransaction: (amount: BigNumber) => void;
}

export function StakingPanel(props: StakingPanelProps): ReactElement {
  const {
    account,
    library,
    signer,
    // chainId,
    // connector,
    buttonLabel,
    // walletActive,
    formDisabled = false,
    submitDisabled = false,
    inputLabel,
    buttonIntent = Intent.PRIMARY,
    pool,
  } = props;

  const { data: [tokens] = [] } = usePoolTokens(pool);
  const { baseAssetContract, yieldAssetContract } = parseSortedTokensForPool(
    tokens
  );
  // Pool calls
  const { data: totalSupplyBN } = useSmartContractReadCall(pool, "totalSupply");
  const totalSupply = +formatEther(totalSupplyBN ?? 0);
  // const spotPrice = usePoolSpotPrice(pool, baseAssetContract);

  const {
    asset: baseAsset,
    symbol: baseAssetSymbol,
    decimals: baseAssetDecimals,
    balanceOf: baseAssetBalanceOf,
    displayBalance: baseAssetDisplayBalance,
    poolBalance: baseAssetPoolBalance,
  } = useTokenInfoForTradeInput(pool, baseAssetContract, account, library);

  // use this hook to make sure we get the ETH icon if the base asset it WETH
  const cryptoAsset = useCryptoAssetForToken(baseAssetContract?.address);
  const baseAssetIcon = cryptoAsset?.assetIcon;

  const {
    asset: yieldAsset,
    decimals: yieldAssetDecimals,
    displayBalance: yieldAssetDisplayBalance,
    poolBalance: yieldAssetPoolBalance,
  } = useTokenInfoForTradeInput(pool, yieldAssetContract, account, library);

  const {
    symbol: trancheAssetSymbol,
    label: trancheAssetSymbolLabel,
  } = useTrancheAssetSymbol(yieldAsset, baseAssetSymbol);

  const baseAssetReserves = +formatUnits(
    baseAssetPoolBalance ?? 0,
    baseAssetDecimals
  );

  const yieldAssetReserves = +formatUnits(
    yieldAssetPoolBalance ?? 0,
    yieldAssetDecimals
  );

  const {
    amountIn,
    amountOut,
    onChangeIn,
    onChangeOut,
    onChangeOutFromIn,
    onChangeInFromOut,
    setValueIn,
  } = useUpdateInputs();

  const isValidBaseAssetValue = validateStakingValue(
    amountIn,
    baseAssetBalanceOf,
    baseAssetDecimals,
    baseAssetPoolBalance
  );

  const isValidTrancheAssetValue = validateStakingValue(
    amountOut,
    baseAssetBalanceOf,
    baseAssetDecimals,
    baseAssetPoolBalance
  );

  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const submitTransaction = useCallback(() => {
    setDrawerOpen(true);
  }, []);

  const setMaxValue = useSetMaxValue(
    baseAssetBalanceOf,
    setValueIn,
    baseAssetDecimals
  );

  const submitButtonDisabled =
    formDisabled ||
    submitDisabled ||
    !isValidBaseAssetValue ||
    !isValidTrancheAssetValue ||
    !amountIn ||
    !amountOut;

  const poolTokenMaxAmounts = [
    parseUnits(amountIn || "0", baseAssetDecimals),
    parseUnits(amountOut || "0", yieldAssetDecimals),
  ];
  const joinConvergentPool = useJoinConvergentPool(
    signer,
    account,
    pool,
    poolTokenMaxAmounts
  );

  // TODO: use differnt join types depending on pool type
  const onStake = useCallback(() => {
    joinConvergentPool();
  }, [joinConvergentPool]);

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
      <StakingInput
        cryptoDisplayBalance={baseAssetDisplayBalance || ""}
        cryptoSymbol={baseAssetSymbol as CryptoSymbol}
        cryptoDecimals={baseAssetDecimals}
        cryptoAssetIcon={baseAssetIcon}
        disabled={formDisabled}
        onChangeInputValue={onChangeIn}
        onCalculateLPOutGivenIn={onChangeOutFromIn}
        value={amountIn}
        validValue={isValidBaseAssetValue}
        tokenPoolReserves={baseAssetReserves}
        otherTokenPoolReserves={yieldAssetReserves}
        totalSupply={totalSupply}
      />

      {/* Receive Asset */}
      <div className={tw("flex", "justify-between", "items-center")}>
        <span>{t`And`}</span>
      </div>
      <StakingInput
        cryptoDisplayBalance={yieldAssetDisplayBalance || ""}
        cryptoSymbol={trancheAssetSymbol as CryptoSymbol}
        cryptoDecimals={baseAssetDecimals}
        cryptoAssetIcon={baseAssetIcon}
        disabled={formDisabled}
        onChangeInputValue={onChangeOut}
        onCalculateLPOutGivenIn={onChangeInFromOut}
        value={amountOut}
        validValue={isValidTrancheAssetValue}
        tokenPoolReserves={yieldAssetReserves}
        otherTokenPoolReserves={baseAssetReserves}
        totalSupply={totalSupply}
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
      <StakingConfirmationDrawer
        library={library}
        account={account}
        baseAsset={baseAsset}
        trancheAsset={yieldAsset}
        baseAssetSymbol={baseAssetSymbol}
        baseAssetSymbolLabel={baseAssetSymbol}
        trancheAssetSymbol={trancheAssetSymbol}
        trancheAssetSymbolLabel={trancheAssetSymbolLabel}
        baseAssetIn={amountIn}
        trancheAssetIn={amountOut}
        isOpen={isDrawerOpen}
        onClose={() => {
          setDrawerOpen(false);
        }}
        onStake={onStake}
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
    (otherNeeded: string, lpOut: number) => {
      if (!otherNeeded) {
        setValueOut(undefined);
      } else {
        setValueOut(`${otherNeeded}`);
      }
    },
    [setValueOut]
  );
  const onChangeInFromOut = useCallback(
    (otherNeeded: string, lpOut: number) => {
      if (!otherNeeded) {
        setValueIn(undefined);
      } else {
        setValueIn(`${otherNeeded}`);
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
