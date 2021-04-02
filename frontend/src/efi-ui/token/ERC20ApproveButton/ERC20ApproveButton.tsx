import React, { FC, useCallback } from "react";
import { useQueryClient } from "react-query";

import { Button, Intent } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { ERC20 } from "elf-contracts/types/ERC20";
import { BigNumber, Signer } from "ethers";
import { t } from "ttag";

import { matchSmartContractReadCallQuery } from "efi-ui/contracts/matchSmartContractReadCallQuery/matchSmartContractReadCallQuery";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { useSmartContractTransaction } from "efi-ui/contracts/useSmartContractTransaction/useSmartContractTransaction";
import { useTokenAllowance } from "efi-ui/token/hooks/useTokenAllowance";
import { MAX_ALLOWANCE } from "efi/contracts/token";

interface ERC20ApproveButtonProps {
  owner: string | null | undefined;
  spender: string | null | undefined;
  contract: ERC20 | undefined;
  approvalAmount: BigNumber | undefined;
  signer: Signer | undefined;
  className?: string;
}
export const ERC20ApproveButton: FC<ERC20ApproveButtonProps> = ({
  owner,
  spender,
  contract,
  approvalAmount,
  signer,
  className,
}) => {
  const { data: assetSymbol } = useSmartContractReadCall(contract, "symbol");
  const { data: marketAllowance } = useTokenAllowance(contract, owner, spender);

  const onApproveClick = useOnApproveClick(contract, signer, owner, spender);

  const hasApproval = !!approvalAmount && marketAllowance?.gte(approvalAmount);

  return (
    <Button
      fill
      large
      outlined
      className={className}
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
