import React, { FC } from "react";

import { Callout, Intent } from "@blueprintjs/core";
import { ERC20 } from "elf-contracts/types/ERC20";
import { BigNumber } from "ethers";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { useBalancerVault } from "efi-ui/balancer/useBalancerVault";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { useTokenAllowance } from "efi-ui/token/hooks/useTokenAllowance";

interface WalletApprovalCalloutProps {
  account: string | null | undefined;
  contract: ERC20 | undefined;
  tokenSymbol?: string;
  approvalAmount: BigNumber | undefined;
  messageRenderer: (assetSymbol: string) => string;
}
export const WalletApprovalCallout: FC<WalletApprovalCalloutProps> = ({
  account,
  approvalAmount,
  contract,
  tokenSymbol: tokenSymbolFromProps,
  messageRenderer,
}) => {
  const { data: symbol } = useSmartContractReadCall(contract, "symbol");
  const assetSymbol = tokenSymbolFromProps || symbol;

  const balancerVault = useBalancerVault();
  const {
    data: marketAllowance,
    isLoading: isAllowanceLoading,
  } = useTokenAllowance(contract, account, balancerVault?.address);

  const hasApproval = !!approvalAmount && marketAllowance?.gte(approvalAmount);
  const showCallout = account && !isAllowanceLoading && !hasApproval;
  if (!showCallout || !assetSymbol) {
    return null;
  }

  const message = messageRenderer(assetSymbol);

  return (
    <Callout
      intent={Intent.WARNING}
      title={t`Wallet approval required`}
      icon={null}
      className={tw("p-4")}
    >
      <div className={"pt-1"}>{message}</div>
    </Callout>
  );
};
