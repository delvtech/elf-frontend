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

  approvalAmount: BigNumber | undefined;
}
export const WalletApprovalCallout: FC<WalletApprovalCalloutProps> = ({
  account,
  approvalAmount,
  contract,
}) => {
  const { data: assetSymbol } = useSmartContractReadCall(contract, "symbol");

  const balancerVault = useBalancerVault();
  const {
    data: marketAllowance,
    isLoading: isAllowanceLoading,
  } = useTokenAllowance(contract, account, balancerVault?.address);

  const hasApproval = !!approvalAmount && marketAllowance?.gte(approvalAmount);
  const showCallout = account && !isAllowanceLoading && !hasApproval;
  if (!showCallout) {
    return null;
  }

  return (
    <Callout
      intent={Intent.WARNING}
      title={t`Wallet approval required`}
      icon={null}
      className={tw("p-4")}
    >
      <div
        className={"pt-1"}
      >{t`Element uses Balancer Pools for trading. You'll need to grant Balancer approval to spend your ${assetSymbol} in order to swap for Principal Tokens.`}</div>
    </Callout>
  );
};
