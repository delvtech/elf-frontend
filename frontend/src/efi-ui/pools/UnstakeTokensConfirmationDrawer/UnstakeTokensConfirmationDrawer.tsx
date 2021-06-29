import { ReactElement } from "react";

import { Web3Provider } from "@ethersproject/providers";
import { TokenInfo } from "@uniswap/token-lists";
import { PrincipalTokenInfo, YieldTokenInfo } from "tokenlists/types";
import { t } from "ttag";

import { findAssetIcon } from "efi-ui/crypto/CryptoIcon";
import { UnstakeConfirmationForm } from "efi-ui/pools/UnstakeTokensConfirmationDrawer/UnstakeConfirmationForm";
import { TransactionDrawer } from "efi-ui/transactions/TransactionDrawer/TransactionDrawer";
import { EMPTY_ARRAY } from "efi/base/emptyArray";
import { getCryptoAssetForToken } from "efi/crypto/getCryptoAssetForToken";
import { getCryptoName } from "efi/crypto/getCryptoName/getCryptoName";
import { getCryptoSymbol } from "efi/crypto/getCryptoSymbol";
import { getTermAssetSymbol } from "efi/tranche/getTermAssetSymbol";
import { WalletApprovalInfo } from "efi/wallets/WalletApprovalInfo";
import {
  isPrincipalToken,
  getVaultTokenInfoForTranche,
} from "efi/tranche/tranches";
import { getPrincipalTokenForYieldToken } from "efi/tranche/yieldTokens";

interface UnstakeConfirmationDrawerProps {
  account: string | null | undefined;
  library: Web3Provider | undefined;
  baseAssetInfo: TokenInfo;
  termAssetInfo: PrincipalTokenInfo | YieldTokenInfo;
  baseAssetValue: string;
  termAssetValue: string;
  lpTokensIn: string;
  isOpen: boolean;
  onClose: () => void;
  onUnstake: () => void;
  isUnstakeLoading: boolean;
  isUnstakeError: boolean;
  isUnstakeSuccess: boolean;
  unstakeError: Error | undefined;
}

export function UnstakeConfirmationDrawer({
  library,
  account,
  baseAssetInfo,
  termAssetInfo,
  baseAssetValue,
  termAssetValue,
  lpTokensIn,
  isOpen,
  onClose,
  isUnstakeError,
  unstakeError,
  isUnstakeLoading,
  isUnstakeSuccess,
  onUnstake,
}: UnstakeConfirmationDrawerProps): ReactElement {
  const baseAsset = getCryptoAssetForToken(baseAssetInfo.address);
  const baseAssetSymbol = getCryptoSymbol(baseAsset);
  const baseAssetSymbolLabel = getCryptoName(baseAsset);
  const baseAssetIcon = findAssetIcon(baseAsset);

  const termAsset = getCryptoAssetForToken(termAssetInfo.address);
  const termAssetIcon = findAssetIcon(termAsset);

  const { address: trancheAddress } = isPrincipalToken(termAssetInfo)
    ? termAssetInfo
    : getPrincipalTokenForYieldToken(termAssetInfo.address);

  const { symbol: vaultSymbol } = getVaultTokenInfoForTranche(trancheAddress);
  const { symbol: termAssetSymbol, label: termAssetSymbolLabel } =
    getTermAssetSymbol(termAssetInfo.address, vaultSymbol);

  return (
    <TransactionDrawer
      library={library}
      account={account}
      transactionPending={isUnstakeLoading}
      transactionSuccess={isUnstakeSuccess}
      transactionError={unstakeError}
      transactionFailed={isUnstakeError}
      confirmButtonDisabled={false}
      buttonLabel={t`Remove liquidity`}
      isOpen={isOpen}
      onClose={onClose}
      onConfirmTransaction={onUnstake}
      walletApprovalInfos={EMPTY_ARRAY as WalletApprovalInfo[]}
      transactionDetails={
        <UnstakeConfirmationForm
          amountIn={lpTokensIn}
          assetOneSymbol={baseAssetSymbol}
          assetTwoSymbol={termAssetSymbol}
          assetOneSymbolLabel={baseAssetSymbolLabel}
          assetTwoSymbolLabel={termAssetSymbolLabel}
          heading={t`Confirm removing liquidity`}
          assetOneIcon={baseAssetIcon}
          assetTwoIcon={termAssetIcon}
          assetOneValueLabel={baseAssetValue}
          assetTwoValueLabel={termAssetValue}
        />
      }
    />
  );
}
