import { ReactElement, useEffect, useMemo } from "react";

import { Web3Provider } from "@ethersproject/providers";
import { BigNumber, Signer } from "ethers";
import { t } from "ttag";

import { getBalancerApprovalMessage } from "efi-ui/balancer/balancerApprovalMessage";
import { useBalancerVault } from "efi-ui/balancer/useBalancerVault";
import { ERC20Shim } from "efi-ui/contracts/ERC20Shim";
import { useCryptoAssetMetadata } from "efi-ui/crypto/hooks/useCryptoAssetMetadata/useCryptAssetMetadata";
import { StakeConfirmationForm } from "efi-ui/pools/StakeTokensConfirmationDrawer/StakeConfirmationForm";
import { useTokenAllowance } from "efi-ui/token/hooks/useTokenAllowance";
import {
  CryptoAsset,
  CryptoAssetType,
  findTokenContract,
} from "efi/crypto/CryptoAsset";
import { parseUnits } from "ethers/lib/utils";
import React from "react";
import {
  TransactionDrawer,
  WalletApprovalInfo,
} from "efi-ui/transactions/TransactionDrawer/TransactionDrawer";

interface StakingConfirmationDrawerProps {
  account: string | null | undefined;
  library: Web3Provider | undefined;
  baseAsset: CryptoAsset | undefined;
  trancheAsset: CryptoAsset | undefined;
  baseAssetSymbol: string | undefined;
  baseAssetSymbolLabel: string | undefined;
  trancheAssetSymbol: string | undefined;
  trancheAssetSymbolLabel: string | undefined;
  baseAssetIn: string | undefined;
  trancheAssetIn: string | undefined;
  isOpen: boolean;
  onClose: () => void;
  onStake: () => void;
  isStakeLoading: boolean;
  isStakeError: boolean;
  isStakeSuccess: boolean;
}

export function StakingConfirmationDrawer({
  library,
  account,
  baseAsset,
  trancheAsset,
  baseAssetSymbol,
  trancheAssetSymbol,
  trancheAssetSymbolLabel,
  baseAssetIn,
  trancheAssetIn,
  isOpen,
  onClose,
  isStakeError,
  isStakeLoading,
  isStakeSuccess,
  onStake,
}: StakingConfirmationDrawerProps): ReactElement {
  const balancerVault = useBalancerVault();
  // close the drawer after stake succeeds

  const {
    icon: baseAssetIcon,
    decimals: baseAssetDecimals,
  } = useCryptoAssetMetadata(baseAsset);
  const {
    icon: trancheAssetIcon,
    decimals: trancheAssetDecimals,
  } = useCryptoAssetMetadata(trancheAsset);

  const baseAssetInBigNumber = parseUnits(
    baseAssetIn ?? "0",
    baseAssetDecimals
  );
  const trancheAssetInBigNumber = parseUnits(
    trancheAssetIn ?? "0",
    trancheAssetDecimals
  );

  const hasTokenApprovals = useHasTokenApprovals(
    account,
    balancerVault?.address,
    baseAsset,
    trancheAsset,
    baseAssetInBigNumber,
    trancheAssetInBigNumber
  );

  // TODO: validate inputs as well
  const confirmButtonDisabled = !hasTokenApprovals;

  const walletApprovalInfos = useWalletApprovalInfos(
    baseAsset,
    trancheAsset,
    account,
    balancerVault?.address
  );

  return (
    <TransactionDrawer
      library={library}
      account={account}
      transactionPending={isStakeLoading}
      transactionSuccess={isStakeSuccess}
      transactionFailed={isStakeError}
      confirmButtonDisabled={confirmButtonDisabled}
      buttonLabel={t`Stake`}
      isOpen={isOpen}
      onClose={onClose}
      onConfirmTransaction={onStake}
      walletApprovalInfos={walletApprovalInfos}
      transactionDetails={
        <StakeConfirmationForm
          assetOneSymbol={baseAssetSymbol}
          assetTwoSymbol={trancheAssetSymbol}
          assetOneSymbolLabel={baseAssetSymbol}
          assetTwoSymbolLabel={trancheAssetSymbolLabel}
          heading={t`Confirm Staking`}
          assetOneIcon={baseAssetIcon}
          assetTwoIcon={trancheAssetIcon}
          assetOneValueLabel={baseAssetIn}
          assetTwoValueLabel={trancheAssetIn}
        />
      }
    />
  );
}
function useWalletApprovalInfos(
  baseAsset: CryptoAsset | undefined,
  trancheAsset: CryptoAsset | undefined,
  account: string | null | undefined,
  vaultAddress: string | undefined
) {
  return useMemo(() => {
    const walletApprovalInfos: WalletApprovalInfo[] = [
      {
        cryptoAsset: trancheAsset,
        ownerAddress: account,
        spenderAddress: vaultAddress,
        messageRenderer: getBalancerApprovalMessage,
      },
    ];
    if (baseAsset?.type !== CryptoAssetType.ETHEREUM) {
      walletApprovalInfos.push({
        cryptoAsset: baseAsset,
        ownerAddress: account,
        spenderAddress: vaultAddress,
        messageRenderer: getBalancerApprovalMessage,
      });
    }
    return walletApprovalInfos;
  }, [account, baseAsset, trancheAsset, vaultAddress]);
}

function getConfirmButtonDisabled(
  account: string | null | undefined,
  baseAsset: CryptoAsset | undefined,
  amountIn: BigNumber | undefined,
  marketAllowance: BigNumber | undefined
) {
  // can't confirm anything w/out a base asset
  if (!baseAsset) {
    return true;
  }

  // must be connected to click this button
  if (!account) {
    return true;
  }

  // disabled when no amount is entered
  if (!amountIn) {
    return true;
  }

  // disabled if it's an erc20 or erc20permits w/out enough allowance.
  // NOTE: we have to use approvals for erc20permits because balancer does not
  // support that
  if (
    [CryptoAssetType.ERC20, CryptoAssetType.ERC20PERMIT].includes(
      baseAsset.type
    )
  ) {
    const hasEnoughAllowance = marketAllowance?.gte(amountIn);
    if (!hasEnoughAllowance) {
      return true;
    }
  }

  // otherwise the button should not be disabled
  return false;
}

const useHasTokenApprovals = (
  ownerAddress: string | null | undefined,
  spenderAddress: string | undefined,
  baseAsset: CryptoAsset | undefined,
  trancheAsset: CryptoAsset | undefined,
  baseAssetIn: BigNumber | undefined,
  trancheAssetIn: BigNumber | undefined
) => {
  const { data: baseAssetAllowance } = useTokenAllowance(
    findTokenContract(baseAsset) as ERC20Shim,
    ownerAddress,
    spenderAddress
  );
  const { data: trancheAssetAllowance } = useTokenAllowance(
    findTokenContract(trancheAsset) as ERC20Shim,
    ownerAddress,
    spenderAddress
  );

  const hasEnoughBaseAssetAllowance = getConfirmButtonDisabled(
    ownerAddress,
    baseAsset,
    baseAssetIn,
    baseAssetAllowance
  );
  const hasEnoughTrancheAssetAllowance = getConfirmButtonDisabled(
    ownerAddress,
    trancheAsset,
    trancheAssetIn,
    trancheAssetAllowance
  );
  return !hasEnoughBaseAssetAllowance || !hasEnoughTrancheAssetAllowance;
};
