import { useCallback } from "react";

import { Tranche } from "elf-contracts/types/Tranche";
import { Signer } from "ethers";
import { parseUnits } from "ethers/lib/utils";

import { useCryptoDecimals } from "efi-ui/crypto/hooks/useCryptoDecimals/useCryptoDecimals";
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
  amountIn: number | undefined
): () => void {
  const userProxy = useUserProxy();
  const baseAssetDecimals = useCryptoDecimals(baseAsset);
  const amountInBigNumber = parseUnits(
    amountIn?.toString() || "0",
    baseAssetDecimals
  );

  const { mutate: mint } = useSmartContractTransactionPersisted(
    userProxy,
    "mint",
    signer
  );

  const mintCallArgs = useMintCallArgs(tranche, baseAsset, amountInBigNumber);
  const onMintTransaction = useCallback(() => {
    if (mintCallArgs) {
      mint(mintCallArgs);
    }
  }, [mint, mintCallArgs]);

  return onMintTransaction;
}
