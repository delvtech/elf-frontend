import { QueryObserverResult } from "react-query";

import { Tranche } from "elf-contracts/types/Tranche";
import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";

import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { useCryptoDecimals } from "efi-ui/crypto/hooks/useCryptoDecimals/useCryptoDecimals";
import { useMintCallArgs } from "efi-ui/mint/hooks/useMintCallArgs";
import { useUserProxy } from "efi-ui/mint/hooks/userProxy";
import { CryptoAsset } from "efi/crypto/CryptoAsset";

/**
 * Returns the number of Principal Tokens you'd get for minting into a tranche.
 * This is useful because in order to mint into a tranche, some amount of
 * principal must be used to cover the current earnings of the YT. This results
 * in less than 1 to 1 principal tokens for your deposit.
 */
export function useMintPreview(
  baseAsset: CryptoAsset | undefined,
  tranche: Tranche | undefined,
  amountIn: number | undefined
): QueryObserverResult<[BigNumber, BigNumber]> {
  const userProxy = useUserProxy();
  const baseAssetDecimals = useCryptoDecimals(baseAsset);
  const amountInBigNumber = parseUnits(
    amountIn?.toString() || "0",
    baseAssetDecimals
  );

  const mintCallArgs = useMintCallArgs(tranche, baseAsset, amountInBigNumber);
  const mintPreviewResult = useSmartContractReadCall(userProxy, "mint", {
    enabled: !!mintCallArgs,
    callArgs: mintCallArgs,
  });

  return mintPreviewResult;
}
