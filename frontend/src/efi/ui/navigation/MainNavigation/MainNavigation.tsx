import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import React, { FC, Fragment, useCallback } from "react";

import { useDarkMode } from "efi/ui/base/useDarkMode/useDarkMode";
import { useNavigation } from "efi/ui/navigation/hooks/useTab";
import { SidebarNavigation } from "efi/ui/navigation/SidebarNavigation/SidebarNavigation";
import { TopbarNavigation } from "efi/ui/navigation/TopbarNavigation/TopbarNavigation";
import { useWallet } from "efi/ui/wallets/hooks/useWallet";
import { injectedConnector } from "efi/wallets/connectors";

interface MainNavigationProps {}
export const MainNavigation: FC<MainNavigationProps> = () => {
  const { account } = useWallet();
  const { activeTab, changeTab } = useNavigation();

  const { isDarkMode, setDarkMode } = useDarkMode();

  const onDarkModeChange = useCallback(
    (event) => setDarkMode((event.target as HTMLInputElement).checked),
    [setDarkMode]
  );

  const { deactivate, activate } = useWeb3React<Web3Provider>();
  const connectToInjectedWallet = useCallback(
    () => activate(injectedConnector),
    [activate]
  );

  return (
    <Fragment>
      {/* Mobile/Tablet */}
      {
        <TopbarNavigation
          deactivate={deactivate}
          isDarkMode={isDarkMode}
          onDarkModeChange={onDarkModeChange}
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
          account={account}
          deactivate={deactivate}
          connectToInjectedWallet={connectToInjectedWallet}
          onDarkModeChange={onDarkModeChange}
        />
      }
    </Fragment>
  );
};
