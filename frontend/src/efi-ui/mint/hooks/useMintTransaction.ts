import { useCallback } from "react";
import { UseMutationResult } from "react-query";

import { UserProxy } from "elf-contracts/types/UserProxy";
import { ContractReceipt, Signer } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { PrincipalTokenInfo as TrancheInfo } from "tokenlists/types";

import { useMintCallArgs } from "efi-ui/mint/hooks/useMintCallArgs";
import { getUserProxy } from "efi-ui/mint/hooks/userProxy";
import { useSmartContractTransactionPersisted } from "efi-ui/transactions/useSmartContractTransactionPersisted/useSmartContractTransactionPersisted";
import { CryptoAsset } from "efi/crypto/CryptoAsset";
import { getCryptoDecimals } from "efi/crypto/getCryptoDecimals";

/**
 * Returns the number of Principal Tokens you'd get for minting into a tranche.
 * This is useful because in order to mint into a tranche, some amount of
 * principal must be used to cover the current earnings of the YT. This results
 * in less than 1 to 1 principal tokens for your deposit.
 */
export function useMintTransaction(
  signer: Signer | undefined,
  baseAsset: CryptoAsset,
  trancheInfo: TrancheInfo,
  amountIn: number,
  onTransactionStarted: () => void
): {
  mint: () => void;
  mutationResult: UseMutationResult<
    ContractReceipt | undefined,
    unknown,
    Parameters<UserProxy["mint"]>
  >;
} {
  const userProxy = getUserProxy(signer);
  const baseAssetDecimals = getCryptoDecimals(baseAsset);
  const amountInBigNumber = parseUnits(amountIn.toString(), baseAssetDecimals);

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
  const mintCallArgs = useMintCallArgs(
    trancheInfo,
    baseAsset,
    amountInBigNumber
  );
  const onMintTransaction = useCallback(() => {
    if (mintCallArgs) {
      mint(mintCallArgs);
    }
  }, [mint, mintCallArgs]);

  return { mint: onMintTransaction, mutationResult };
}
