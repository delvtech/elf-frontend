import { useCallback } from "react";
import { useQueryClient } from "react-query";
import { ERC20 } from "elf-contracts/types/ERC20";
import { Signer } from "ethers";
import { matchSmartContractReadCallQuery } from "efi-ui/contracts/matchSmartContractReadCallQuery/matchSmartContractReadCallQuery";
import { useSmartContractTransaction } from "efi-ui/contracts/useSmartContractTransaction/useSmartContractTransaction";
import { MAX_ALLOWANCE } from "efi/contracts/token";

export function useERC20Approve(
  baseAssetContract: ERC20 | undefined,
  signer: Signer | undefined,
  owner: string | null | undefined,
  spender: string | null | undefined
): () => void {
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
