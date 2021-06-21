import { ConvergentPoolCanPerformActions } from "canperform/CanPerformJsonFile";
import { useCanPerform } from "efi-ui/canperform/useCanPerform";

type ConvergentPoolAction = keyof Omit<
  ConvergentPoolCanPerformActions,
  "convergentPoolAddress"
>;
export function useConvergentPoolCanPerform(
  convergentPoolAddress: string,
  action: ConvergentPoolAction
): boolean {
  const {
    canPerform: { convergentPools },
  } = useCanPerform();

  const convergentPoolCanPerform = convergentPools.find(
    (covergentPool) =>
      covergentPool.convergentPoolAddress === convergentPoolAddress
  );

  // If there's no canPerform entry for this tranche than assume it's not frozen
  if (!convergentPoolCanPerform) {
    return true;
  }

  return !!convergentPoolCanPerform[action];
}
