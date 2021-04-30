import { usePref } from "efi-ui/prefs/usePref/usePref";

export enum PoolAction {
  SWAP = "swap",
  STAKE = "stake",
  UNSTAKE = "unstake",
}
interface PoolActionsPref {
  tab: PoolAction;
  setTab: (tab: PoolAction) => void;
}

const POOL_VIEW_ACTION_TAB_PREF_ID = "poolview-action-tab";

export function usePoolViewPoolActionsTab(): PoolActionsPref {
  const { pref: tab = PoolAction.SWAP, setPref: setTab } = usePref<PoolAction>(
    POOL_VIEW_ACTION_TAB_PREF_ID,
    PoolAction.SWAP
  );

  return {
    tab,
    setTab,
  };
}
