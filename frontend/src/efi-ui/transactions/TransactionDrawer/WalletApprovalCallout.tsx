import React, { ReactElement } from "react";

import {
  Button,
  Callout,
  Intent,
  Spinner,
  SpinnerSize,
} from "@blueprintjs/core";
import { BigNumber, Signer } from "ethers";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { ERC20Shim } from "efi/contracts/ERC20Shim";
import { getCryptoSymbol } from "efi/crypto/getCryptoSymbol";
import { useERC20Approve } from "efi-ui/token/hooks/useERC20Approve";
import { useTokenAllowance } from "efi-ui/token/hooks/useTokenAllowance";
import { MAX_ALLOWANCE } from "efi/contracts/token";
import {
  CryptoAsset,
  CryptoAssetType,
  findTokenContract,
} from "efi/crypto/CryptoAsset";

interface WalletApprovalCalloutPropsOld {
  signer: Signer | undefined;
  ownerAddress: string | null | undefined;
  spenderAddress: string | undefined;
  cryptoAsset: CryptoAsset | undefined;
  approvalAmount: BigNumber | undefined;
  message: string;
}
export function WalletApprovalCalloutOld({
  ownerAddress,
  spenderAddress,
  signer,
  message,
  cryptoAsset,
  approvalAmount,
}: WalletApprovalCalloutPropsOld): ReactElement | null {
  const cryptoAssetContract = findTokenContract(cryptoAsset);
  const { data: marketAllowance, isLoading: isAllowanceLoading } =
    useTokenAllowance(
      cryptoAssetContract as ERC20Shim,
      ownerAddress,
      spenderAddress
    );

  const {
    onApproveClick,
    mutationResult: { isLoading },
  } = useERC20Approve(
    cryptoAssetContract as ERC20Shim,
    signer,
    ownerAddress,
    spenderAddress
  );

  // Ethereum does not need approvals
  if (cryptoAsset?.type === CryptoAssetType.ETHEREUM) {
    return null;
  }

  // If the user isn't connected, there can be no approvals
  if (!ownerAddress) {
    return null;
  }

  // Don't show if there is no amount
  if (
    !approvalAmount ||
    isAllowanceLoading ||
    marketAllowance?.gte(approvalAmount)
  ) {
    return null;
  }

  return (
    <Callout
      intent={Intent.WARNING}
      title={t`Wallet approval required`}
      icon={null}
      className={tw("p-4", "space-y-4")}
    >
      <div className={"pt-1"}>{message}</div>
      <Button
        large
        fill
        disabled={isLoading}
        outlined
        intent={Intent.WARNING}
        onClick={onApproveClick}
      >
        {isLoading ? (
          <Spinner size={SpinnerSize.SMALL} intent={Intent.WARNING} />
        ) : (
          t`Approve`
        )}
      </Button>
    </Callout>
  );
}

interface WalletApprovalCalloutProps {
  signer: Signer | undefined;
  ownerAddress: string | null | undefined;
  spenderAddress: string | null | undefined;
  cryptoAsset: CryptoAsset | undefined;
  messageRenderer: (assetSymbol: string) => string;
}
export function WalletApprovalCallout({
  ownerAddress,
  spenderAddress,
  signer,
  messageRenderer,
  cryptoAsset,
}: WalletApprovalCalloutProps): ReactElement | null {
  const symbol = getCryptoSymbol(cryptoAsset);
  const message = symbol ? messageRenderer(symbol) : undefined;

  const tokenContract = findTokenContract(cryptoAsset);

  const { data: allowance, isLoading: isAllowanceLoading } = useTokenAllowance(
    tokenContract as ERC20Shim,
    ownerAddress,
    spenderAddress
  );
  const {
    onApproveClick,
    mutationResult: { isLoading },
  } = useERC20Approve(
    tokenContract as ERC20Shim,
    signer,
    ownerAddress,
    spenderAddress
  );

  // Ethereum does not need approvals
  if (cryptoAsset?.type === CryptoAssetType.ETHEREUM) {
    return null;
  }

  // If the user isn't connected, there can be no approvals
  if (!ownerAddress) {
    return null;
  }

  // if the approval already exists
  if (isAllowanceLoading || allowance?.gte(MAX_ALLOWANCE)) {
    return null;
  }

  return (
    <Callout
      intent={Intent.WARNING}
      title={t`Wallet approval required`}
      icon={null}
      className={tw("p-4", "space-y-4")}
    >
      <div className={"pt-1"}>{message}</div>
      <Button
        large
        fill
        disabled={isLoading}
        outlined
        intent={Intent.WARNING}
        onClick={onApproveClick}
      >
        {isLoading ? (
          <Spinner size={SpinnerSize.SMALL} intent={Intent.WARNING} />
        ) : (
          t`Approve`
        )}
      </Button>
    </Callout>
  );
}
