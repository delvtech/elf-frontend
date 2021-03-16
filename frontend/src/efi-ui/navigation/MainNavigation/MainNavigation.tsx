import React, { FC, Fragment } from "react";

import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";

import { useNavigation } from "efi-ui/navigation/hooks/useTab";
import { SidebarNavigation } from "efi-ui/navigation/SidebarNavigation/SidebarNavigation";
import { TopbarNavigation } from "efi-ui/navigation/TopbarNavigation/TopbarNavigation";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { getConnectorName } from "efi/wallets/connectors";

interface MainNavigationProps {}
export const MainNavigation: FC<MainNavigationProps> = () => {
  const {
    deactivate,
    account,
    active,
    chainId,
    connector,
    library,
  } = useWeb3React<Web3Provider>();
  const { activeTab, changeTab } = useNavigation();
  const { isDarkMode } = useDarkMode();

  return (
    <Fragment>
      {/* Mobile/Tablet */}
      {
        <TopbarNavigation
          account={account}
          active={active}
          chainId={chainId}
          connectorName={getConnectorName(connector, library)}
          deactivate={deactivate}
          isDarkMode={isDarkMode}
          activeTab={activeTab}
          changeTab={changeTab}
        />
      }

      {/* Desktop */}
      {
        <SidebarNavigation
          account={account}
          active={active}
          chainId={chainId}
          connectorName={getConnectorName(connector, library)}
          isDarkMode={isDarkMode}
          changeTab={changeTab}
          activeTab={activeTab}
        />
      }
    </Fragment>
  );
};
