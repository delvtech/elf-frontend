import { useLocalStorage } from "react-use";

export enum FeatureFlag {
  ZAP_PURCHASE = "ZAP_PURCHASE",
}

export function useFeatureFlag(flagKey: FeatureFlag): boolean {
  const [flag] = useLocalStorage(flagKey, false);
  return !!flag;
}
