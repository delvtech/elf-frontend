import React, { FC, useCallback } from "react";
import { useQueryClient } from "react-query";

import { Button, Intent } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { ERC20 } from "elf-contracts/types/ERC20";
import { BigNumber, Signer } from "ethers";
import { t } from "ttag";

import { useBalancerVault } from "efi-ui/balancer/useBalancerVault";
import { matchSmartContractReadCallQuery } from "efi-ui/contracts/matchSmartContractReadCallQuery/matchSmartContractReadCallQuery";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { useSmartContractTransaction } from "efi-ui/contracts/useSmartContractTransaction/useSmartContractTransaction";
import { MAX_ALLOWANCE } from "efi/contracts/token";

interface ERC20ApproveButtonProps {
  account: string | null | undefined;
  contract: ERC20 | undefined;
  approvalAmount: BigNumber | undefined;
  signer: Signer | undefined;
}
export const ERC20ApproveButton: FC<ERC20ApproveButtonProps> = ({
  account,
  contract,
  approvalAmount,
  signer,
}) => {
  const { data: assetSymbol } = useSmartContractReadCall(contract, "symbol");
  const balancerVault = useBalancerVault();
  const { data: marketAllowance } = useAllowance(
    contract,
    account,
    balancerVault?.address
  );

  const onApproveClick = useOnApproveClick(
    contract,
    signer,
    account,
    balancerVault?.address
  );

  const hasApproval = !!approvalAmount && marketAllowance?.gte(approvalAmount);
  return (
    <Button
      fill
      large
      outlined
      icon={hasApproval ? IconNames.TICK : null}
      disabled={hasApproval}
      intent={hasApproval ? Intent.SUCCESS : Intent.PRIMARY}
      onClick={onApproveClick}
    >
      {hasApproval ? t`${assetSymbol} approved` : t`Approve ${assetSymbol}`}
    </Button>
  );
};

function useOnApproveClick(
  baseAssetContract: ERC20 | undefined,
  signer: Signer | undefined,
  owner: string | null | undefined,
  spender: string | null | undefined
) {
  const queryClient = useQueryClient();
  const { mutate: approve } = useSmartContractTransaction(
    baseAssetContract,
    "approve",
    signer,
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          predicate: (query) => {
            const match = matchSmartContractReadCallQuery(
              query,
              baseAssetContract,
              "allowance",
              [owner as string, spender as string]
            );
            return match;
          },
        });
      },
    }
  );

  const onApproveClick = useCallback(() => {
    if (spender) {
      approve([spender, MAX_ALLOWANCE]);
    }
  }, [approve, spender]);
  return onApproveClick;
}

function useAllowance(
  contract: ERC20 | undefined,
  owner: string | null | undefined,
  spender: string | null | undefined
) {
  return useSmartContractReadCall(contract, "allowance", {
    enabled: !!owner && !!spender,
    callArgs: [owner as string, spender as string],
  });
}
