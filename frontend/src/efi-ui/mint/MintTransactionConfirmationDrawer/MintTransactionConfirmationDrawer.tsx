import { ReactElement } from "react";

import { Web3Provider } from "@ethersproject/providers";
import { Signer } from "ethers";
import {
  PrincipalTokenInfo as TrancheInfo,
  YieldTokenInfo,
} from "tokenlists/types";
import { t } from "ttag";

import { useMintPreview } from "efi-ui/mint/hooks/useMintPreview";
import { useMintTransaction } from "efi-ui/mint/hooks/useMintTransaction";
import { MintTransactionDetails } from "efi-ui/mint/MintTransactionDetails/MintTransactionDetails";
import { SwapDetailsForm } from "efi-ui/swaps/SwapDetailsPreview/SwapDetailsForm";
import { TokenIcon } from "efi-ui/token/TokenIcon";
import { TransactionDrawer } from "efi-ui/transactions/TransactionDrawer/TransactionDrawer";
import { convertEpochSecondsToDate2 } from "efi/base/convertEpochSecondsToDate";
import { CryptoAsset } from "efi/crypto/CryptoAsset";
import { getCryptoSymbol } from "efi/crypto/getCryptoSymbol";
import { getTokenInfo } from "efi/tokenlists";

interface MintTransactionConfirmationDrawerProps {
  account: string | null | undefined;
  library: Web3Provider | undefined;

  amountIn: string;
  baseAsset: CryptoAsset;
  baseAssetIcon: TokenIcon;
  principalTokenSymbol: string;
  yieldTokenSymbol: string;

  trancheInfo: TrancheInfo;
  isOpen: boolean;

  onClose: () => void;
}

export function MintTransactionConfirmationDrawer({
  library,
  account,
  baseAssetIcon: BaseAssetIcon,
  baseAsset,
  principalTokenSymbol,
  yieldTokenSymbol,
  trancheInfo,
  amountIn,
  isOpen,
  onClose,
}: MintTransactionConfirmationDrawerProps): ReactElement {
  const signer = account ? (library?.getSigner(account) as Signer) : undefined;

  const baseAssetSymbol = getCryptoSymbol(baseAsset);
  const {
    interestToken: interestTokenAddress,
    unlockTimestamp: trancheUnlockTimestamp,
  } = trancheInfo.extensions;
  const yieldTokenInfo = getTokenInfo<YieldTokenInfo>(interestTokenAddress);

  const unlockTimeStampDate = convertEpochSecondsToDate2(
    trancheUnlockTimestamp
  );

  const amountInAsNumber = +(amountIn || 0);
  const numPrincipalTokens = useMintPreview(trancheInfo, amountInAsNumber);

  const {
    mint,
    mutationResult: { isLoading, isSuccess, isError },
  } = useMintTransaction(
    signer,
    account,
    baseAsset,
    trancheInfo,
    yieldTokenInfo,
    amountInAsNumber,
    onClose
  );

  return (
    <TransactionDrawer
      buttonLabel={t`Mint`}
      transactionPending={isLoading}
      transactionFailed={isError}
      transactionSuccess={isSuccess}
      walletApprovalInfos={[]}
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
            principalTokenSymbol={principalTokenSymbol}
            yieldTokenSymbol={yieldTokenSymbol}
            unlockTimestamp={unlockTimeStampDate}
            numPrincipalTokens={numPrincipalTokens}
            numYieldTokens={amountInAsNumber}
          />
        </SwapDetailsForm>
      }
    />
  );
}
