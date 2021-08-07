import { useCallback } from "react";

import { useLocation, useNavigate } from "@reach/router";

import { SaveNavigation } from "efi-ui/saveApp/navigation/SaveNavigation/SaveNavigation";
import { typeAassertNever } from "efi/base/typeAssertNever";

type ChangeTabFn = (tabId: SaveNavigation) => void;
export function useSaveNavigation(): {
  changeTab: ChangeTabFn;
  activeTab: SaveNavigation;
} {
  const changeTab = useSaveNavigationChange();
  const activeTab = useSaveNavigationActiveTab();
  return { changeTab, activeTab };
}
export function useSaveNavigationChange(): ChangeTabFn {
  const navigate = useNavigate();
  return useCallback(
    (tabId: SaveNavigation) => {
      navigate(`/${tabId}`);
    },
    [navigate]
  );
}

export function useSaveNavigationActiveTab(): SaveNavigation {
  const location = useLocation();
  const navigation = location?.pathname?.split("/")[1] as SaveNavigation;

  switch (navigation) {
    case SaveNavigation.PORTFOLIO: {
      return SaveNavigation.PORTFOLIO;
    }
    case SaveNavigation.HOME: {
      return SaveNavigation.HOME;
    }

    default:
      typeAassertNever(navigation);
      return SaveNavigation.HOME;
  }
}
