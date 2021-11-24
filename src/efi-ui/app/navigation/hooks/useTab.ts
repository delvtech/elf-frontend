import { useActiveTab } from "efi-ui/app/navigation/hooks/useActiveTab";
import { useChangeTab } from "efi-ui/app/navigation/hooks/useChangeTab";
import { Navigation } from "efi-ui/app/navigation/navigation";

export interface UseTab {
  changeTab: (tabId: Navigation) => void;
  activeTab: Navigation;
}
export function useNavigation(): UseTab {
  const changeTab = useChangeTab();
  const activeTab = useActiveTab();

  return { changeTab, activeTab };
}
