import { ReactElement, useCallback, useState } from "react";

import { Button, Intent } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { ERC20 } from "elf-contracts/types/ERC20";
import { WeightedPool } from "elf-contracts/types/WeightedPool";
import { BigNumber, Signer } from "ethers";
import { formatEther, formatUnits, parseUnits } from "ethers/lib/utils";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { useNumericInput } from "efi-ui/base/hooks/useNumericInput/useNumericInput";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { findAssetIcon2 } from "efi-ui/crypto/CryptoIcon";
import { StakingConfirmationDrawer } from "efi-ui/pools/StakeTokensConfirmationDrawer/StakeTokensConfirmationDrawer";
import { StakingInput } from "efi-ui/pools/StakingInput/StakingInput";
import { useJoinConvergentPool } from "efi-ui/pools/useJoinConvergentPool/useJoinConvergentPool";
import { useJoinWeightedPool } from "efi-ui/pools/useJoinWeightedPool";
import { useTokenPoolBalance } from "efi-ui/pools/useTokenPoolBalance/useTokenPoolBalance";
import { useTokenBalanceOf } from "efi-ui/token/hooks/useTokenBalanceOf";
import { useTokenDecimals } from "efi-ui/token/hooks/useTokenDecimals";
import { ConnectWalletDialog } from "efi-ui/wallets/ConnectWalletDialog/ConnectWalletDialog";
import { useEthBalance } from "efi-ui/wallets/hooks/useEthBalance/useEthBalance";
import ContractAddresses from "efi/addresses";
import { BALANCER_ETH_SENTINEL } from "efi/balancer";
import { formatBalance } from "efi/base/formatBalance";
import { ContractMethodArgs } from "efi/contracts/types";
import { CryptoSymbol } from "efi/crypto/CryptoSymbol";
import { getCryptoAssetForToken } from "efi/crypto/getCryptoAssetForToken";
import { getCryptoSymbol } from "efi/crypto/getCryptoSymbol";
import { getPoolTokens } from "efi/pools/getPoolTokens";
import { PoolContract } from "efi/pools/PoolContract";
import { PoolInfo } from "efi/pools/PoolInfo";
import { validateStakingValue } from "efi/staking/validateStakeValue";
import { getTermAssetSymbol } from "efi/tranche/getTermAssetSymbol";
import { trancheContracts } from "efi/tranche/tranches";
import { getPoolContract } from "efi/pools/getPoolContract";

interface StakingPanelProps {
  library: Web3Provider | undefined;
  signer: Signer | undefined;
  account: string | null | undefined;
  poolInfo: PoolInfo;
  formDisabled?: boolean;
  submitDisabled?: boolean;
  buttonLabel: string;
  buttonIntent?: Intent;
}

export function StakingPanel(props: StakingPanelProps): ReactElement {
  const {
    account,
    library,
    signer,
    buttonLabel,
    formDisabled = false,
    submitDisabled = false,
    poolInfo,
  } = props;
  const pool = getPoolContract(poolInfo.address);

  const [isWalletDialogOpen, setWalletDialogOpen] = useState(false);
  // local state
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const onClickButton = useCallback(() => {
    if (!account) {
      return setWalletDialogOpen(true);
    }
    openDrawer();
  }, [account, openDrawer]);

  const {
    baseAssetContract,
    baseAssetIndex,
    termAssetContract,
    termAssetIndex,
  } = getPoolTokens(poolInfo);
  // Pool calls
  const { data: totalSupplyBN } = useSmartContractReadCall(pool, "totalSupply");
  const totalSupply = formatEther(totalSupplyBN ?? 0);

  const {
    asset: baseAsset,
    symbol: baseAssetSymbol,
    decimals: baseAssetDecimals,
    balanceOf: baseAssetBalanceOf,
    displayBalance: baseAssetDisplayBalance,
    poolBalance: baseAssetPoolBalance,
  } = useTokenInfoForTradeInput(pool, baseAssetContract, account, library);

  // use this hook to make sure we get the ETH icon if the base asset it WETH
  const cryptoAsset = getCryptoAssetForToken(baseAssetContract?.address);
  const BaseAssetIcon = findAssetIcon2(cryptoAsset);

  const {
    asset: termAsset,
    symbol: termAssetSymbol,
    address: termAssetAddress,
    decimals: termAssetDecimals,
    balanceOf: termAssetBalanceOf,
    displayBalance: termAssetDisplayBalance,
    poolBalance: termAssetPoolBalance,
  } = useTokenInfoForTradeInput(pool, termAssetContract, account, library);
  const isPrincipalPoolType = trancheContracts
    .map(({ address }) => address)
    .includes(termAssetAddress ?? "");

  const { label: termAssetSymbolLabel } = getTermAssetSymbol(
    termAssetAddress,
    baseAssetSymbol
  );

  const baseAssetReserves = formatUnits(
    baseAssetPoolBalance ?? 0,
    baseAssetDecimals
  );

  const yieldAssetReserves = formatUnits(
    termAssetPoolBalance ?? 0,
    termAssetDecimals
  );

  const { stringValue: amountIn, setValue: onChangeIn } = useNumericInput();
  const { stringValue: amountOut, setValue: onChangeOut } = useNumericInput();

  const isValidBaseAssetValue = validateStakingValue(
    amountIn,
    baseAssetBalanceOf,
    baseAssetDecimals
  );

  const isValidTrancheAssetValue = validateStakingValue(
    amountOut,
    termAssetBalanceOf,
    termAssetDecimals
  );

  const onClose = useCallback(() => {
    setDrawerOpen(false);
    onChangeIn("");
    onChangeOut("");
  }, [onChangeIn, onChangeOut]);

  const poolTokenMaxAmounts = [BigNumber.from(0), BigNumber.from(0)];
  poolTokenMaxAmounts[baseAssetIndex] = parseUnits(
    amountIn || "0",
    baseAssetDecimals
  );
  poolTokenMaxAmounts[termAssetIndex] = parseUnits(
    amountOut || "0",
    termAssetDecimals
  );

  const {
    onJoinPool: joinConvergentPool,
    mutationResult: {
      isLoading: isJoinCCPoolLoading,
      isSuccess: isJoinCCPoolSuccess,
      isError: isJoinCCPoolError,
    },
  } = useJoinConvergentPool(
    signer,
    account,
    pool,
    poolTokenMaxAmounts,
    onClose
  );

  const {
    onJoinPool: joinWeightedPool,
    mutationResult: {
      isLoading: isJoinWPoolLoading,
      isSuccess: isJoinWPoolSuccess,
      isError: isJoinWPoolError,
    },
  } = useJoinWeightedPool(
    signer,
    account,
    pool as WeightedPool,
    poolTokenMaxAmounts,
    onClose
  );

  const onStake = useCallback(() => {
    if (isPrincipalPoolType) {
      joinConvergentPool();
    } else {
      joinWeightedPool();
    }
  }, [isPrincipalPoolType, joinConvergentPool, joinWeightedPool]);

  const insufficientBalance =
    parseUnits(amountIn || "0", baseAssetDecimals).gt(
      baseAssetBalanceOf ?? 0
    ) ||
    parseUnits(amountOut || "0", termAssetDecimals).gt(termAssetBalanceOf ?? 0);

  const invalidInput =
    formDisabled ||
    submitDisabled ||
    insufficientBalance ||
    !isValidBaseAssetValue ||
    !isValidTrancheAssetValue ||
    !amountIn ||
    !amountOut;
  const submitButtonDisabled = !!account && invalidInput;

  let submitButtonLabel = buttonLabel;
  let submitButtonError = false;
  if (!amountIn && !amountOut) {
    submitButtonLabel = t`Enter an amount`;
  }
  if (insufficientBalance && account) {
    submitButtonError = true;
    submitButtonLabel = t`Insufficient balance`;
  }
  if (!account) {
    submitButtonLabel = t`Connect wallet`;
  }

  return (
    <div
      className={tw(
        "flex",
        "flex-col",
        "justify-around",
        "h-full",
        "space-y-2"
      )}
    >
      <StakingInput
        cryptoSymbol={termAssetSymbol as CryptoSymbol}
        cryptoDecimals={baseAssetDecimals}
        cryptoAssetIcon={BaseAssetIcon}
        cryptoBalanceOf={termAssetBalanceOf}
        cryptoDisplayBalance={termAssetDisplayBalance || ""}
        disabled={formDisabled}
        onChange={onChangeOut}
        onPreviewUpdate={onChangeIn}
        labelTopLeft={t`Term asset`}
        value={amountOut}
        validValue={isValidTrancheAssetValue}
        tokenPoolReserves={yieldAssetReserves}
        otherTokenPoolReserves={baseAssetReserves}
        totalSupply={totalSupply}
      />
      <div style={{ height: 40, width: "100%" }} />
      <StakingInput
        cryptoSymbol={baseAssetSymbol as CryptoSymbol}
        cryptoDecimals={baseAssetDecimals}
        cryptoAssetIcon={BaseAssetIcon}
        cryptoBalanceOf={baseAssetBalanceOf}
        cryptoDisplayBalance={baseAssetDisplayBalance || ""}
        disabled={formDisabled}
        onChange={onChangeIn}
        onPreviewUpdate={onChangeOut}
        labelTopLeft={t`Base asset`}
        value={amountIn}
        validValue={isValidBaseAssetValue}
        tokenPoolReserves={baseAssetReserves}
        otherTokenPoolReserves={yieldAssetReserves}
        totalSupply={totalSupply}
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
      <StakingConfirmationDrawer
        library={library}
        account={account}
        baseAsset={baseAsset}
        trancheAsset={termAsset}
        baseAssetSymbol={baseAssetSymbol}
        baseAssetSymbolLabel={baseAssetSymbol}
        trancheAssetSymbol={termAssetSymbol}
        trancheAssetSymbolLabel={termAssetSymbolLabel}
        baseAssetIn={amountIn}
        trancheAssetIn={amountOut}
        isOpen={isDrawerOpen}
        onClose={onClose}
        isStakeLoading={
          isPrincipalPoolType ? isJoinCCPoolLoading : isJoinWPoolLoading
        }
        isStakeError={
          isPrincipalPoolType ? isJoinCCPoolError : isJoinWPoolError
        }
        isStakeSuccess={
          isPrincipalPoolType ? isJoinCCPoolSuccess : isJoinWPoolSuccess
        }
        onStake={onStake}
      />
      <ConnectWalletDialog
        isOpen={isWalletDialogOpen}
        onClose={() => setWalletDialogOpen(false)}
      />
    </div>
  );
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

  const asset = getCryptoAssetForToken(tokenContract?.address);
  const symbol = getCryptoSymbol(asset);
  const icon = findAssetIcon2(asset);

  // otherwise get values from token calls
  const poolBalance = useTokenPoolBalance(pool, tokenContract);

  const { data: decimals } = useTokenDecimals(tokenContract);
  const { data: tokenBalance } = useTokenBalanceOf(tokenContract, account);

  const balanceOf = isWETH ? ethBalance : tokenBalance;
  const displayBalance = formatBalance(balanceOf, decimals);
  const address = isWETH ? BALANCER_ETH_SENTINEL : tokenContract?.address;
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
