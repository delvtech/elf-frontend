import React, { ReactElement } from "react";

import { Button, Callout, Intent } from "@blueprintjs/core";
import { BigNumber, Signer } from "ethers";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { useBalancerVault } from "efi-ui/balancer/useBalancerVault";
import { useTokenAllowance } from "efi-ui/token/hooks/useTokenAllowance";
import {
  CryptoAsset,
  CryptoAssetType,
  findTokenContract,
} from "efi/crypto/CryptoAsset";
import { ERC20Shim } from "efi-ui/contracts/ERC20Shim";
import { useERC20Approve } from "efi-ui/token/hooks/useERC20Approve";

interface WalletApprovalCalloutProps {
  signer: Signer | undefined;
  account: string | null | undefined;
  cryptoAsset: CryptoAsset | undefined;
  approvalAmount: BigNumber | undefined;
  message: string;
}
export function WalletApprovalCallout({
  account,
  signer,
  message,
  cryptoAsset,
  approvalAmount,
}: WalletApprovalCalloutProps): ReactElement | null {
  const balancerVault = useBalancerVault();
  const cryptoAssetContract = findTokenContract(cryptoAsset);
  const {
    data: marketAllowance,
    isLoading: isAllowanceLoading,
  } = useTokenAllowance(
    cryptoAssetContract as ERC20Shim,
    account,
    balancerVault?.address
  );

  const onApproveClick = useERC20Approve(
    cryptoAssetContract as ERC20Shim,
    signer,
    account,
    balancerVault?.address
  );

  const hasApproval = !!approvalAmount && marketAllowance?.gte(approvalAmount);
  const showCallout = account && !isAllowanceLoading && !hasApproval;
  if (!showCallout || cryptoAsset?.type === CryptoAssetType.ETHEREUM) {
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
        outlined
        intent={Intent.WARNING}
        onClick={onApproveClick}
      >
        {t`Approve`}
      </Button>
    </Callout>
  );
}
