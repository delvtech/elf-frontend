import { CryptoAsset } from "elf/crypto/CryptoAsset";

interface FixedRateInputAssetInfo {
  inputAsset: CryptoAsset;
  inputAssetAddress: string;
}

export function useFixedRateInputAssetInfo(
  inputTokenAddress: string
): FixedRateInputAssetInfo {
  return {} as FixedRateInputAssetInfo;
}
