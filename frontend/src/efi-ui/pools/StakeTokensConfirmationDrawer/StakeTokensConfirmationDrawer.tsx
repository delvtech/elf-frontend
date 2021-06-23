import { ReactElement, useMemo } from "react";

import { Web3Provider } from "@ethersproject/providers";
import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { t } from "ttag";

import { getBalancerApprovalMessage } from "efi-ui/balancer/balancerApprovalMessage";
import { useBalancerVault } from "efi-ui/balancer/useBalancerVault";
import { findAssetIcon } from "efi-ui/crypto/CryptoIcon";
import { StakeConfirmationForm } from "efi-ui/pools/StakeTokensConfirmationDrawer/StakeConfirmationForm";
import { useTokenAllowance } from "efi-ui/token/hooks/useTokenAllowance";
import { TokenIcon } from "efi-ui/token/TokenIcon";
import { TransactionDrawer } from "efi-ui/transactions/TransactionDrawer/TransactionDrawer";
import { ERC20Shim } from "efi/contracts/ERC20Shim";
import {
  CryptoAsset,
  CryptoAssetType,
  findTokenContract,
} from "efi/crypto/CryptoAsset";
import { WalletApprovalInfo } from "efi/wallets/WalletApprovalInfo";

interface StakingConfirmationDrawerProps {
  account: string | null | undefined;
  library: Web3Provider | undefined;
  baseAsset: CryptoAsset;
  termAsset: CryptoAsset;
  baseAssetDecimals: number;
  termAssetDecimals: number;
  baseAssetSymbol: string;
  baseAssetSymbolLabel: string;
  termAssetSymbol: string;
  termAssetSymbolLabel: string;
  baseAssetIn: string;
  termAssetIn: string;
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
  termAsset,
  termAssetDecimals,
  baseAssetDecimals,
  baseAssetSymbol,
  termAssetSymbol,
  termAssetSymbolLabel,
  baseAssetIn,
  termAssetIn,
  isOpen,
  onClose,
  isStakeError,
  isStakeLoading,
  isStakeSuccess,
  onStake,
}: StakingConfirmationDrawerProps): ReactElement {
  const balancerVault = useBalancerVault();
  // close the drawer after stake succeeds

  const baseAssetIcon = findAssetIcon(baseAsset) as TokenIcon;
  const termAssetIcon = findAssetIcon(termAsset) as TokenIcon;

  const baseAssetInBigNumber = parseUnits(
    baseAssetIn || "0",
    baseAssetDecimals
  );
  const trancheAssetInBigNumber = parseUnits(
    termAssetIn || "0",
    termAssetDecimals
  );

  const hasTokenApprovals = useHasTokenApprovals(
    account,
    balancerVault?.address,
    baseAsset,
    termAsset,
    baseAssetInBigNumber,
    trancheAssetInBigNumber
  );

  // TODO: validate inputs as well
  const confirmButtonDisabled = !hasTokenApprovals;

  const walletApprovalInfos = useWalletApprovalInfos(
    baseAsset,
    termAsset,
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
          assetTwoSymbol={termAssetSymbol}
          assetOneSymbolLabel={baseAssetSymbol}
          assetTwoSymbolLabel={termAssetSymbolLabel}
          heading={t`Confirm Staking`}
          assetOneIcon={baseAssetIcon}
          assetTwoIcon={termAssetIcon}
          assetOneValueLabel={baseAssetIn}
          assetTwoValueLabel={termAssetIn}
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
