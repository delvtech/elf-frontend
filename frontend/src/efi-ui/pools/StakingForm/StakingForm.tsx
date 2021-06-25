import React, {
  Fragment,
  ReactElement,
  ReactEventHandler,
  ReactNode,
  useCallback,
  useState,
} from "react";

import { Intent } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { ERC20 } from "elf-contracts/types/ERC20";
import { WeightedPool } from "elf-contracts/types/WeightedPool";
import { BigNumber, Signer } from "ethers";
import { formatEther, formatUnits, parseUnits } from "ethers/lib/utils";
import { t } from "ttag";

import { useNumericInput } from "efi-ui/base/hooks/useNumericInput/useNumericInput";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { findAssetIcon } from "efi-ui/crypto/CryptoIcon";
import { StakingConfirmationDrawer } from "efi-ui/pools/StakeTokensConfirmationDrawer/StakeTokensConfirmationDrawer";
import { useJoinConvergentPool } from "efi-ui/pools/useJoinConvergentPool/useJoinConvergentPool";
import { useJoinWeightedPool } from "efi-ui/pools/useJoinWeightedPool";
import { useTokenPoolBalance } from "efi-ui/pools/useTokenPoolBalance/useTokenPoolBalance";
import { useTokenBalanceOf } from "efi-ui/token/hooks/useTokenBalanceOf";
import { TokenIcon } from "efi-ui/token/TokenIcon";
import { ConnectWalletDialog } from "efi-ui/wallets/ConnectWalletDialog/ConnectWalletDialog";
import { useEthBalance } from "efi-ui/wallets/hooks/useEthBalance/useEthBalance";
import ContractAddresses from "efi/addresses";
import { BALANCER_ETH_SENTINEL } from "efi/balancer";
import { formatBalance } from "efi/base/formatBalance";
import { CryptoSymbol } from "efi/crypto/CryptoSymbol";
import { getCryptoAssetForToken } from "efi/crypto/getCryptoAssetForToken";
import { getCryptoSymbol2 } from "efi/crypto/getCryptoSymbol";
import { getPoolContract } from "efi/pools/getPoolContract";
import { getPoolTokens } from "efi/pools/getPoolTokens";
import { PoolContract } from "efi/pools/PoolContract";
import { PoolInfo } from "efi/pools/PoolInfo";
import { validateStakingValue } from "efi/staking/validateStakeValue";
import { getTokenInfo } from "efi/tokenlists";
import { getTermAssetSymbol } from "efi/tranche/getTermAssetSymbol";
import { trancheContracts } from "efi/tranche/tranches";

interface StakingAssetInputProps {
  cryptoSymbol: CryptoSymbol;
  cryptoDecimals: number | undefined;
  cryptoAssetIcon: TokenIcon;
  cryptoBalanceOf: BigNumber | undefined;
  cryptoDisplayBalance: string | number;
  disabled: boolean;
  onPreviewUpdate: (otherNeeded: string, lpOut: string | undefined) => void;
  onChange: (inputValue: string) => void;
  labelTopLeft: string | undefined;
  value: string | undefined;
  validValue: boolean;
  tokenPoolReserves: string | undefined;
  otherTokenPoolReserves: string | undefined;
  totalSupply: string | undefined;
}

interface StakingSubmitButtonProps {
  disabled: boolean;
  label: string;
  error: boolean;
  onClick: ReactEventHandler;
}

interface StakingInputProps {
  termAssetInputProps: StakingAssetInputProps;
  baseAssetInputProps: StakingAssetInputProps;
  submitButtonProps: StakingSubmitButtonProps;
}
interface StakingFormProps {
  library: Web3Provider | undefined;
  signer: Signer | undefined;
  account: string | null | undefined;
  poolInfo: PoolInfo;
  formDisabled?: boolean;
  submitDisabled?: boolean;
  buttonLabel: string;
  buttonIntent?: Intent;
  children: (inputProps: StakingInputProps) => ReactNode;
}

export function StakingForm(props: StakingFormProps): ReactElement {
  const {
    account,
    library,
    signer,
    buttonLabel,
    formDisabled = false,
    submitDisabled = false,
    poolInfo,
    children,
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
  const termCryptoAsset = getCryptoAssetForToken(termAssetContract?.address);
  const BaseAssetIcon = findAssetIcon(cryptoAsset);
  const TermAssetIcon = findAssetIcon(termCryptoAsset);

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
    <Fragment>
      {children({
        termAssetInputProps: {
          cryptoSymbol: termAssetSymbol as CryptoSymbol,
          cryptoDecimals: baseAssetDecimals,
          cryptoAssetIcon: TermAssetIcon,
          cryptoBalanceOf: termAssetBalanceOf,
          cryptoDisplayBalance: termAssetDisplayBalance || "",
          disabled: formDisabled,
          onChange: onChangeOut,
          onPreviewUpdate: onChangeIn,
          labelTopLeft: t`Term asset`,
          value: amountOut,
          validValue: isValidTrancheAssetValue,
          tokenPoolReserves: yieldAssetReserves,
          otherTokenPoolReserves: baseAssetReserves,
          totalSupply: totalSupply,
        },
        baseAssetInputProps: {
          cryptoSymbol: baseAssetSymbol as CryptoSymbol,
          cryptoDecimals: baseAssetDecimals,
          cryptoAssetIcon: BaseAssetIcon,
          cryptoBalanceOf: baseAssetBalanceOf,
          cryptoDisplayBalance: baseAssetDisplayBalance || "",
          disabled: formDisabled,
          onChange: onChangeIn,
          onPreviewUpdate: onChangeOut,
          labelTopLeft: t`Base asset`,
          value: amountIn,
          validValue: isValidBaseAssetValue,
          tokenPoolReserves: baseAssetReserves,
          otherTokenPoolReserves: yieldAssetReserves,
          totalSupply: totalSupply,
        },
        submitButtonProps: {
          disabled: submitButtonDisabled,
          label: submitButtonLabel,
          error: submitButtonError,
          onClick: onClickButton,
        },
      })}
      <StakingConfirmationDrawer
        library={library}
        account={account}
        baseAsset={baseAsset}
        termAsset={termAsset}
        baseAssetDecimals={baseAssetDecimals}
        termAssetDecimals={termAssetDecimals}
        baseAssetSymbol={baseAssetSymbol}
        baseAssetSymbolLabel={baseAssetSymbol}
        termAssetSymbol={termAssetSymbol}
        termAssetSymbolLabel={termAssetSymbolLabel}
        baseAssetIn={amountIn}
        termAssetIn={amountOut}
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
    </Fragment>
  );
}

function useTokenInfoForTradeInput(
  pool: PoolContract,
  tokenContract: ERC20,
  account: string | null | undefined,
  library: Web3Provider | undefined
) {
  const isWETH = tokenContract?.address === ContractAddresses.wethAddress;
  const { data: ethBalance } = useEthBalance(library, account);

  const asset = getCryptoAssetForToken(tokenContract?.address);
  const symbol = getCryptoSymbol2(asset);
  const icon = findAssetIcon(asset);

  // otherwise get values from token calls
  const poolBalance = useTokenPoolBalance(pool, tokenContract);

  const { decimals } = getTokenInfo(tokenContract.address);
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
