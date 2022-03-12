import { getTokenAddressForBalancer } from "elf/balancer/getTokenAddressForBalancer";
import { CryptoAsset } from "elf/crypto/CryptoAsset";
import { getCryptoAssetForToken } from "elf/crypto/getCryptoAssetForToken";

interface FixedRateInputAssetInfo {
  inputAsset: CryptoAsset;
  inputAssetAddress: string;
  inputAssetName: string;
  inputAssetSymbol: string;
  inputAssetDecimals: number;
}

export function useFixedRateInputAssetInfo(
  inputTokenAddress: string
): FixedRateInputAssetInfo {
  const inputAsset = getCryptoAssetForToken(inputTokenAddress);

  // reconcile the "in" token for both swap purchase and zap purchase
  const inputAssetAddress = getTokenAddressForBalancer(inputAsset);

  return {} as FixedRateInputAssetInfo;
}
