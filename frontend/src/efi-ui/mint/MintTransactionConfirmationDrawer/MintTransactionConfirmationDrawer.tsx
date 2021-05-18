import { ReactElement, useMemo } from "react";

import { Web3Provider } from "@ethersproject/providers";
import { Tranche } from "elf-contracts/types/Tranche";
import { Signer } from "ethers";
import { t } from "ttag";

import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { getCryptoSymbol } from "efi/crypto/getCryptoSymbol";
import { useMintPreview } from "efi-ui/mint/hooks/useMintPreview";
import { useMintTransaction } from "efi-ui/mint/hooks/useMintTransaction";
import { useUserProxy } from "efi-ui/mint/hooks/userProxy";
import { MintTransactionDetails } from "efi-ui/mint/MintTransactionDetails/MintTransactionDetails";
import { getUserProxyApprovalMessage } from "efi-ui/mint/userProxyApprovalMessage";
import { SwapDetailsForm } from "efi-ui/swaps/SwapDetailsPreview/SwapDetailsForm";
import { TokenIcon } from "efi-ui/token/TokenIcon";
import { TransactionDrawer } from "efi-ui/transactions/TransactionDrawer/TransactionDrawer";
import { convertEpochSecondsToDate } from "efi/base/convertEpochSecondsToDate";
import { CryptoAsset, CryptoAssetType } from "efi/crypto/CryptoAsset";

interface MintTransactionConfirmationDrawerProps {
  account: string | null | undefined;
  library: Web3Provider | undefined;

  amountIn: string | undefined;
  baseAsset: CryptoAsset | undefined;
  baseAssetIcon: TokenIcon | undefined;

  tranche: Tranche | undefined;
  isOpen: boolean;

  onClose: () => void;
}

export function MintTransactionConfirmationDrawer({
  library,
  account,
  baseAssetIcon: BaseAssetIcon,
  baseAsset,
  tranche,
  amountIn,
  isOpen,
  onClose,
}: MintTransactionConfirmationDrawerProps): ReactElement {
  const signer = account ? (library?.getSigner(account) as Signer) : undefined;
  const userProxy = useUserProxy();

  // base asset calls
  const baseAssetSymbol = getCryptoSymbol(baseAsset);

  // tranche calls
  const { data: trancheUnlockTimestamp } = useSmartContractReadCall(
    tranche,
    "unlockTimestamp"
  );
  const unlockTimeStampDate = convertEpochSecondsToDate(trancheUnlockTimestamp);

  const amountInAsNumber = +(amountIn || 0);
  const numPrincipalTokens = useMintPreview(tranche, amountInAsNumber);

  const {
    mint,
    mutationResult: { isLoading, isSuccess, isError },
  } = useMintTransaction(signer, baseAsset, tranche, amountInAsNumber, onClose);

  // close the drawer after mint succeeds
  const walletApprovalInfos = useWalletApprovalInfos(
    baseAsset,
    account,
    userProxy?.address
  );

  return (
    <TransactionDrawer
      buttonLabel={t`Mint`}
      transactionPending={isLoading}
      transactionFailed={isError}
      transactionSuccess={isSuccess}
      walletApprovalInfos={walletApprovalInfos}
      isOpen={isOpen}
      onClose={onClose}
      account={account}
      library={library}
      onConfirmTransaction={mint}
      transactionDetails={
        <SwapDetailsForm
          amountIn={amountInAsNumber.toFixed(4)}
          heading={t`Mint Preview`}
          assetInIcon={BaseAssetIcon}
          amountInLabel={t`Deposit`}
          assetInSymbol={baseAssetSymbol}
          assetOutSymbol={`${baseAssetSymbol} Principal Token`}
          assetOutIcon={null}
        >
          <MintTransactionDetails
            baseAssetSymbol={baseAssetSymbol}
            unlockTimestamp={unlockTimeStampDate}
            numPrincipalTokens={numPrincipalTokens}
            numYieldTokens={amountInAsNumber}
          />
        </SwapDetailsForm>
      }
    />
  );
}

function useWalletApprovalInfos(
  baseAsset: CryptoAsset | undefined,
  account: string | null | undefined,
  userProxyAddress: string | undefined
) {
  return useMemo(() => {
    if (!baseAsset || baseAsset.type === CryptoAssetType.ETHEREUM) {
      return;
    }
    return [
      {
        cryptoAsset: baseAsset,
        ownerAddress: account,
        spenderAddress: userProxyAddress,
        messageRenderer: getUserProxyApprovalMessage,
      },
    ];
  }, [account, baseAsset, userProxyAddress]);
}
