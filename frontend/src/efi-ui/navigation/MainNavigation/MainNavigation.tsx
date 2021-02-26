import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import React, { FC, Fragment } from "react";

import { useNavigation } from "efi-ui/navigation/hooks/useTab";
import { SidebarNavigation } from "efi-ui/navigation/SidebarNavigation/SidebarNavigation";
import { TopbarNavigation } from "efi-ui/navigation/TopbarNavigation/TopbarNavigation";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";

interface MainNavigationProps {}
export const MainNavigation: FC<MainNavigationProps> = () => {
  const { activeTab, changeTab } = useNavigation();
  const { isDarkMode } = useDarkMode();

  const { deactivate } = useWeb3React<Web3Provider>();

  return (
    <Fragment>
      {/* Mobile/Tablet */}
      {
        <TopbarNavigation
          deactivate={deactivate}
          isDarkMode={isDarkMode}
          activeTab={activeTab}
          changeTab={changeTab}
        />
      }

      {/* Desktop */}
      {
        <SidebarNavigation
          isDarkMode={isDarkMode}
          changeTab={changeTab}
          activeTab={activeTab}
        />
      }
    </Fragment>
  );
};
