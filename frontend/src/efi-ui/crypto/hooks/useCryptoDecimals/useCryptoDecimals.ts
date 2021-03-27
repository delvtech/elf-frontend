import { CryptoAsset, findTokenContract } from "efi/crypto/CryptoAsset";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { NUM_ETH_DECIMALS } from "efi/crypto/ethereum";

export function useCryptoDecimals(asset: CryptoAsset | undefined): number {
  const tokenContract = asset ? findTokenContract(asset) : undefined;
  const { data: tokenDecimals } = useSmartContractReadCall(
    tokenContract,
    "decimals"
  );

  if (tokenDecimals !== undefined) {
    return tokenDecimals;
  }

  return NUM_ETH_DECIMALS;
}
