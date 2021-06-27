import {
  Fragment,
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Callout, Switch } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { ERC20Permit } from "elf-contracts/types";
import { Signer } from "ethers";
import {
  PrincipalTokenInfo as TrancheInfo,
  YieldTokenInfo,
} from "tokenlists/types";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { useMintPreview } from "efi-ui/mint/hooks/useMintPreview";
import {
  useMintApprovals,
  useMintTransaction,
} from "efi-ui/mint/hooks/useMintTransaction";
import { MintTransactionDetails } from "efi-ui/mint/MintTransactionDetails/MintTransactionDetails";
import { SwapDetailsForm } from "efi-ui/swaps/SwapDetailsPreview/SwapDetailsForm";
import { TokenIcon } from "efi-ui/token/TokenIcon";
import { TransactionDrawer } from "efi-ui/transactions/TransactionDrawer/TransactionDrawer";
import ContractAddresses from "efi/addresses";
import { convertEpochSecondsToDate } from "efi/base/convertEpochSecondsToDate";
import { CryptoAsset, CryptoAssetType } from "efi/crypto/CryptoAsset";
import { getCryptoDecimals } from "efi/crypto/getCryptoDecimals";
import { getCryptoSymbol2 } from "efi/crypto/getCryptoSymbol";
import { interestTokenContractsByAddress } from "efi/interestToken/interestToken";
import { getTokenInfo } from "efi/tokenlists";
import { trancheContractsByAddress } from "efi/tranche/tranches";
import {
  isUnderlyingAddressERC20Permit,
  underlyingContractsByAddress,
} from "efi/underlying/underlying";
import { WalletApprovalInfo } from "efi/wallets/WalletApprovalInfo";
import { TransactionError } from "efi-ui/contracts/TransactionError";

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
  const [loadingPermits, setLoadingPermits] = useState(false);

  const [includePermits, setIncludePermits] = useState(true);

  const baseAssetSymbol = getCryptoSymbol2(baseAsset);
  const {
    interestToken: interestTokenAddress,
    unlockTimestamp: trancheUnlockTimestamp,
  } = trancheInfo.extensions;
  const yieldTokenInfo = getTokenInfo<YieldTokenInfo>(interestTokenAddress);

  const unlockTimeStampDate = convertEpochSecondsToDate(trancheUnlockTimestamp);

  const amountInAsNumber = +(amountIn || 0);
  const numPrincipalTokens = useMintPreview(trancheInfo, amountInAsNumber);

  const onError = useCallback((error: TransactionError) => {
    setLoadingPermits(false);
  }, []);

  const {
    mint,
    mutationResult: { isLoading, isError, error, isSuccess, reset },
  } = useMintTransaction(
    signer,
    account,
    baseAsset,
    trancheInfo,
    yieldTokenInfo,
    amountInAsNumber,
    includePermits,
    onClose,
    onError
  );

  const onCloseDrawer = useCallback(() => {
    setLoadingPermits(false);
    reset();
    onClose();
  }, [onClose, reset]);

  const onConfirmMint = useCallback(async () => {
    setLoadingPermits(true);
    try {
      mint();
    } catch (error) {
      setLoadingPermits(false);
    }
  }, [mint]);
  useEffect(() => {
    if (isLoading || isError) {
      setLoadingPermits(false);
    }
  }, [isError, isLoading]);

  const { showPermitCallout, showWalletApprovalCallout } = useShowCallouts(
    trancheInfo,
    yieldTokenInfo,
    baseAsset,
    account
  );

  const useApprovals = showPermitCallout && !includePermits;
  const walletApprovalInfos = useWalletApprovalInfos(
    baseAsset,
    account,
    useApprovals || showWalletApprovalCallout
  );

  return (
    <TransactionDrawer
      buttonLabel={t`Mint`}
      transactionPending={isLoading || loadingPermits}
      transactionError={error as Error | undefined}
      transactionFailed={isError}
      transactionSuccess={isSuccess}
      walletApprovalInfos={walletApprovalInfos}
      isOpen={isOpen}
      onClose={onCloseDrawer}
      account={account}
      library={library}
      onConfirmTransaction={onConfirmMint}
      transactionDetails={
        <div className={tw("flex", "flex-col", "space-y-8")}>
          <SwapDetailsForm
            amountIn={amountInAsNumber.toFixed(4)}
            heading={t`Mint Preview`}
            assetInIcon={BaseAssetIcon}
            amountInLabel={t`Deposit`}
            assetInSymbol={baseAssetSymbol}
            assetOutSymbol={`${baseAssetSymbol} Principal Token`}
            assetOutIcon={null}
          >
            <Fragment>
              <MintTransactionDetails
                baseAssetSymbol={baseAssetSymbol}
                principalTokenSymbol={principalTokenSymbol}
                yieldTokenSymbol={yieldTokenSymbol}
                unlockTimestamp={unlockTimeStampDate}
                numPrincipalTokens={numPrincipalTokens}
                numYieldTokens={amountInAsNumber}
              />
              {showPermitCallout && (
                <Callout>
                  <div>
                    <Switch
                      label={t`Include token approvals for providing liquidity. (Turn this off if you are using a Ledger wallet.)`}
                      checked={includePermits}
                      onChange={() => setIncludePermits(!includePermits)}
                    />
                    {includePermits &&
                      t`You need to approve Balancer to use one or more of the
                        tokens you are about to mint. If you plan to LP your
                        tokens in the future, you can save on gas by
                        pre-approving these tokens now.`}
                  </div>
                </Callout>
              )}
            </Fragment>
          </SwapDetailsForm>
        </div>
      }
    />
  );
}
function useShowCallouts(
  trancheInfo: TrancheInfo,
  yieldTokenInfo: YieldTokenInfo,
  baseAsset: CryptoAsset,
  account: string | null | undefined
) {
  const { balancerVaultAddress, userProxyContractAddress } = ContractAddresses;
  const baseAssetContract = underlyingContractsByAddress[
    trancheInfo.extensions.underlying
  ] as unknown as ERC20Permit;
  const yieldTokenContract =
    interestTokenContractsByAddress[yieldTokenInfo.address];
  const principalTokenContract = trancheContractsByAddress[trancheInfo.address];
  const baseAssetDecimals = getCryptoDecimals(baseAsset);
  const { decimals: principalTokenDecimals } = trancheInfo;
  const { decimals: yieldTokenDecimals } = yieldTokenInfo;

  const approvals = useMintApprovals(
    account,
    userProxyContractAddress,
    balancerVaultAddress,
    baseAssetContract,
    principalTokenContract,
    yieldTokenContract,
    baseAssetDecimals,
    principalTokenDecimals,
    yieldTokenDecimals
  );

  const {
    userProxyApprovedForBaseAsset,
    balancerApprovedForBaseAsset,
    balancerApprovedForPrincipalToken,
    balancerApprovedForYieldToken,
  } = approvals;

  const baseAssetIsERC20Permit = isUnderlyingAddressERC20Permit(
    baseAssetContract?.address
  );

  let showPermitCallout = false;
  if (
    (baseAssetIsERC20Permit && !balancerApprovedForBaseAsset) ||
    !balancerApprovedForPrincipalToken ||
    !balancerApprovedForYieldToken
  ) {
    showPermitCallout = true;
  }

  let showWalletApprovalCallout = false;
  if (
    !userProxyApprovedForBaseAsset &&
    !baseAssetIsERC20Permit &&
    baseAsset.type !== CryptoAssetType.ETHEREUM
  ) {
    showWalletApprovalCallout = true;
  }

  return { showPermitCallout, showWalletApprovalCallout };
}

function useWalletApprovalInfos(
  tokenInAsset: CryptoAsset,
  account: string | null | undefined,
  useApprovals: boolean
): WalletApprovalInfo[] {
  const { userProxyContractAddress } = ContractAddresses;
  const assetSymbol = getCryptoSymbol2(tokenInAsset);
  return useMemo(() => {
    if (
      !useApprovals ||
      !tokenInAsset ||
      tokenInAsset.type === CryptoAssetType.ETHEREUM
    ) {
      return [];
    }
    return [
      {
        cryptoAsset: tokenInAsset,
        ownerAddress: account,
        spenderAddress: userProxyContractAddress,
        messageRenderer: () => t`
          You need to grant Element approval to spend your ${assetSymbol} in order to perform this transaction.
        `,
      },
    ];
  }, [
    account,
    assetSymbol,
    tokenInAsset,
    useApprovals,
    userProxyContractAddress,
  ]);
}
