import { useCallback } from "react";
import { UseMutationResult, useQueryClient } from "react-query";

import { ERC20 } from "elf-contracts/types/ERC20";
import { BigNumberish, ContractTransaction, Overrides, Signer } from "ethers";

import { matchSmartContractReadCallQuery } from "efi-ui/contracts/matchSmartContractReadCallQuery/matchSmartContractReadCallQuery";
import { useSmartContractTransactionPersisted } from "efi-ui/transactions/useSmartContractTransactionPersisted/useSmartContractTransactionPersisted";
import { MAX_ALLOWANCE } from "efi/contracts/token";

interface UseERC20Approve {
  onApproveClick: () => void;
  mutationResult: UseMutationResult<
    ContractTransaction | undefined,
    unknown,
    [account: string, amount: BigNumberish, overrides?: Overrides | undefined],
    unknown
  >;
}
export function useERC20Approve(
  baseAssetContract: ERC20 | undefined,
  signer: Signer | undefined,
  owner: string | null | undefined,
  spender: string | null | undefined
): UseERC20Approve {
  const queryClient = useQueryClient();
  const mutationResult = useSmartContractTransactionPersisted(
    baseAssetContract,
    "approve",
    signer,
    {
      onTransactionSuccess: () => {
        queryClient.invalidateQueries({
          predicate: (query) => {
            const match = matchSmartContractReadCallQuery(
              query,
              baseAssetContract?.address,
              "allowance",
              [owner as string, spender as string]
            );
            return match;
          },
        });
      },
    }
  );

  const { mutate: approve } = mutationResult;

  const onApproveClick = useCallback(() => {
    if (spender) {
      approve([spender, MAX_ALLOWANCE]);
    }
  }, [approve, spender]);
  return { onApproveClick, mutationResult };
}
