import { CryptoAsset, findTokenContract } from "efi/crypto/CryptoAsset";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { NUM_ETH_DECIMALS } from "efi/crypto/ethereum";

export function useCryptoDecimals(asset: CryptoAsset): number {
  const tokenContract = findTokenContract(asset);
  const { data: tokenDecimals } = useSmartContractReadCall(
    tokenContract,
    "decimals"
  );

  if (tokenDecimals !== undefined) {
    return tokenDecimals;
  }

  return NUM_ETH_DECIMALS;
}
