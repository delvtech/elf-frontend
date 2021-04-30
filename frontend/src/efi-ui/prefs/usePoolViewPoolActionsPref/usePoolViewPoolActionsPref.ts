import { usePref } from "efi-ui/prefs/usePref/usePref";

type PoolActionsTabs = "trade" | "stake" | "unstake";
interface PoolActionsPref {
  tab: PoolActionsTabs;
  setTab: (tab: PoolActionsTabs) => void;
}

const POOL_VIEW_ACTION_TAB_PREF_ID = "poolview-action-tab";

export function usePoolViewPoolActionsTab(): PoolActionsPref {
  const { pref: tab, setPref: setTab } = usePref<PoolActionsTabs>(
    POOL_VIEW_PREF_ID,
    "trade"
  );

  return {
    tab,
    setTab,
  };
}
