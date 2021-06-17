import { useCallback } from "react";
import { UseMutationResult } from "react-query";

import { Tranche } from "elf-contracts/types/Tranche";
import { UserProxy } from "elf-contracts/types/UserProxy";
import { ContractReceipt, Signer } from "ethers";
import { parseUnits } from "ethers/lib/utils";

import { getCryptoDecimals } from "efi/crypto/getCryptoDecimals";
import { useMintCallArgs } from "efi-ui/mint/hooks/useMintCallArgs";
import { useUserProxy } from "efi-ui/mint/hooks/userProxy";
import { useSmartContractTransactionPersisted } from "efi-ui/transactions/useSmartContractTransactionPersisted/useSmartContractTransactionPersisted";
import { CryptoAsset } from "efi/crypto/CryptoAsset";

/**
 * Returns the number of Principal Tokens you'd get for minting into a tranche.
 * This is useful because in order to mint into a tranche, some amount of
 * principal must be used to cover the current earnings of the YT. This results
 * in less than 1 to 1 principal tokens for your deposit.
 */
export function useMintTransaction(
  signer: Signer | undefined,
  baseAsset: CryptoAsset | undefined,
  tranche: Tranche | undefined,
  amountIn: number | undefined,
  onTransactionStarted: () => void
): {
  mint: () => void;
  mutationResult: UseMutationResult<
    ContractReceipt | undefined,
    unknown,
    Parameters<UserProxy["mint"]>
  >;
} {
  const userProxy = useUserProxy();
  const baseAssetDecimals = getCryptoDecimals(baseAsset);
  const amountInBigNumber = parseUnits(
    amountIn?.toString() || "0",
    baseAssetDecimals
  );

  const mutationResult = useSmartContractTransactionPersisted(
    userProxy,
    "mint",
    signer,
    {
      onTransactionSubmitted: () => {
        onTransactionStarted();
      },
    }
  );
  const { mutate: mint } = mutationResult;
  const mintCallArgs = useMintCallArgs(tranche, baseAsset, amountInBigNumber);
  const onMintTransaction = useCallback(() => {
    if (mintCallArgs) {
      mint(mintCallArgs);
    }
  }, [mint, mintCallArgs]);

  return { mint: onMintTransaction, mutationResult };
}
