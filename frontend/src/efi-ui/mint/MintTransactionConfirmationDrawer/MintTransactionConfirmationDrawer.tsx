import { ReactElement, useState } from "react";

import { Web3Provider } from "@ethersproject/providers";
import { Signer } from "ethers";
import {
  PrincipalTokenInfo as TrancheInfo,
  YieldTokenInfo,
} from "tokenlists/types";
import { t } from "ttag";

import { useMintPreview } from "efi-ui/mint/hooks/useMintPreview";
import {
  useMintApprovals,
  useMintTransaction,
} from "efi-ui/mint/hooks/useMintTransaction";
import { MintTransactionDetails } from "efi-ui/mint/MintTransactionDetails/MintTransactionDetails";
import { SwapDetailsForm } from "efi-ui/swaps/SwapDetailsPreview/SwapDetailsForm";
import { TokenIcon } from "efi-ui/token/TokenIcon";
import { TransactionDrawer } from "efi-ui/transactions/TransactionDrawer/TransactionDrawer";
import { convertEpochSecondsToDate2 } from "efi/base/convertEpochSecondsToDate";
import { CryptoAsset } from "efi/crypto/CryptoAsset";
import { getCryptoSymbol } from "efi/crypto/getCryptoSymbol";
import { getTokenInfo } from "efi/tokenlists";
import { EMPTY_ARRAY } from "efi/base/emptyArray";
import { WalletApprovalInfo } from "efi/wallets/WalletApprovalInfo";
import tw from "efi-tailwindcss-classnames";
import { Callout, Switch } from "@blueprintjs/core";
import ContractAddresses from "efi/addresses";
import { ERC20Permit } from "elf-contracts/types";
import {
  isUnderlyingAddressERC20Permit,
  underlyingContractsByAddress,
} from "efi/underlying/underlying";
import { interestTokenContractsByAddress } from "efi/interestToken/interestToken";
import { trancheContractsByAddress } from "efi/tranche/tranches";
import { getCryptoDecimals } from "efi/crypto/getCryptoDecimals";

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

  const [includePermits, setIncludePermits] = useState(true);

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
    includePermits,
    onClose
  );

  const showPermitCallout = useShowPermitCallout(
    trancheInfo,
    yieldTokenInfo,
    baseAsset,
    account
  );

  return (
    <TransactionDrawer
      buttonLabel={t`Mint`}
      transactionPending={isLoading}
      transactionFailed={isError}
      transactionSuccess={isSuccess}
      walletApprovalInfos={EMPTY_ARRAY as WalletApprovalInfo[]}
      isOpen={isOpen}
      onClose={onClose}
      account={account}
      library={library}
      onConfirmTransaction={mint}
      transactionDetails={
        <div className={tw("flex", "flex-col", "space-y-8")}>
          {showPermitCallout && (
            <Callout>
              <div>
                <Switch
                  label={t`Include approvals to allow tokens to be staked.`}
                  checked={includePermits}
                  onChange={() => setIncludePermits(!includePermits)}
                />
                {t`You need to approve balancer to use one or more of the tokens you are about to mint.
                   If you plan to stake your tokens, you can save on gas by pre approving these tokens now.`}
              </div>
            </Callout>
          )}

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
        </div>
      }
    />
  );
}
function useShowPermitCallout(
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
  const baseAssetDecimals = getCryptoDecimals(baseAsset) ?? 18;
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

  console.log("approvals", approvals);

  const {
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
  return showPermitCallout;
}
