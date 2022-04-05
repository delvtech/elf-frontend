import { FeatureFlag } from "elf/featureFlag/featureFlag";
import { useRouter } from "next/router";

export function useFeatureFlag(flagKey: FeatureFlag): boolean {
  return useRouter().query?.features === flagKey;
}
