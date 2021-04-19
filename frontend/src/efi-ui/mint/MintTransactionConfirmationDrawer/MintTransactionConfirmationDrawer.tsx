import { ReactElement } from "react";

import { Web3Provider } from "@ethersproject/providers";
import { AbstractConnector } from "@web3-react/abstract-connector";
import { Tranche } from "elf-contracts/types/Tranche";
import { Signer } from "ethers";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { t } from "ttag";

import { SwapDetailsForm } from "efi-ui/swaps/SwapDetailsPreview/SwapDetailsForm";
import { TransactionDrawer } from "efi-ui/transactions/TransactionDrawer/TransactionDrawer";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { CryptoAssetWithIcon } from "efi-ui/crypto/CryptoAssetWithIcon";
import { useCryptoDecimals } from "efi-ui/crypto/hooks/useCryptoDecimals/useCryptoDecimals";
import { useCryptoSymbol } from "efi-ui/crypto/hooks/useCryptoSymbol/useCryptoSymbol";
import { useMintPreview } from "efi-ui/mint/hooks/useMintPreview";
import { useMintTransaction } from "efi-ui/mint/hooks/useMintTransaction";
import { useUserProxy } from "efi-ui/mint/hooks/userProxy";
import { MintTransactionDetails } from "efi-ui/mint/MintTransactionDetails/MintTransactionDetails";
import { getUserProxyApprovalMessage } from "efi-ui/mint/userProxyApprovalMessage";
import { convertEpochSecondsToDate } from "efi/base/convertEpochSecondsToDate";

interface MintTransactionConfirmationDrawerProps {
  chainId: number | undefined;
  account: string | null | undefined;
  walletConnectionActive: boolean;
  connector: AbstractConnector | undefined;
  library: Web3Provider | undefined;

  amountIn: string | undefined;
  baseAsset: CryptoAssetWithIcon;

  tranche: Tranche | undefined;
  isOpen: boolean;

  onClose: () => void;
}

export function MintTransactionConfirmationDrawer({
  connector,
  walletConnectionActive,
  library,
  chainId,
  account,
  baseAsset: { assetIcon: AssetIcon },
  baseAsset,
  tranche,
  amountIn,
  isOpen,
  onClose,
}: MintTransactionConfirmationDrawerProps): ReactElement {
  const signer = account ? (library?.getSigner(account) as Signer) : undefined;
  const userProxy = useUserProxy();

  // base asset calls
  const baseAssetSymbol = useCryptoSymbol(baseAsset);
  const baseAssetDecimals = useCryptoDecimals(baseAsset);

  // tranche calls
  const { data: trancheUnlockTimestamp } = useSmartContractReadCall(
    tranche,
    "unlockTimestamp"
  );
  const unlockTimeStampDate = convertEpochSecondsToDate(trancheUnlockTimestamp);

  const amountInAsBigNumber = parseUnits(amountIn || "0", baseAssetDecimals);
  const amountInAsNumber = +(amountIn || 0);
  const { data: [ptPreview] = [] } = useMintPreview(
    baseAsset,
    tranche,
    amountInAsNumber
  );
  const { data: trancheDecimals } = useSmartContractReadCall(
    tranche,
    "decimals"
  );

  const numPrincipalTokens = ptPreview
    ? +formatUnits(ptPreview, trancheDecimals)
    : undefined;

  const onMintTransaction = useMintTransaction(
    signer,
    baseAsset,
    tranche,
    amountInAsNumber
  );

  return (
    <TransactionDrawer
      approvalSpenderAddress={userProxy?.address}
      isOpen={isOpen}
      onClose={onClose}
      account={account}
      assetIn={baseAsset}
      assetInIcon={baseAsset.assetIcon}
      walletConnectionActive={walletConnectionActive}
      walletApprovalMessageRenderer={getUserProxyApprovalMessage}
      amountIn={amountInAsBigNumber}
      chainId={chainId}
      connector={connector}
      library={library}
      onConfirmTransaction={onMintTransaction}
      transactionDetails={
        <SwapDetailsForm
          amountIn={amountInAsNumber.toFixed(4)}
          heading={t`Mint Preview`}
          assetInIcon={AssetIcon}
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
