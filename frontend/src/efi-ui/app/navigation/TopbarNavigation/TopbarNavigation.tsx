import { ReactElement } from "react";

import {
  Button,
  Divider,
  Spinner,
  SpinnerSize,
  Tab,
  Tabs,
} from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { t } from "ttag";

import logoDark from "efi-static-assets/logos/svg/logo--dark.svg";
import logo from "efi-static-assets/logos/svg/logo--light.svg";
import tw from "efi-tailwindcss-classnames";
import { useNavigation } from "efi-ui/app/navigation/hooks/useTab";
import { Navigation } from "efi-ui/app/navigation/navigation";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { usePendingTransactionPref } from "efi-ui/transactions/usePendingTransactionPref/usePendingTransactionPref";
import { ConnectWalletButton2 } from "efi-ui/wallets/ConnectWalletButton/ConnectWalletButton2";

interface TopbarNavigationProps {
  chainId: number | undefined;
  account: string | null | undefined;
  active: boolean;
  connectorName: string | undefined;
  deactivate: () => void;
  hamburgerButton: ReactElement;
}

export function TopbarNavigation({
  account,
  active: walletConnectionActive,
  chainId,
  hamburgerButton,
}: TopbarNavigationProps): ReactElement {
  const { activeTab, changeTab } = useNavigation();
  const { isDarkMode, setDarkModeOff, setDarkModeOn } = useDarkMode();
  const { transactionHash } = usePendingTransactionPref();
  const hasPendingTransaction = !!transactionHash;

  return (
    <div className={tw("flex", "w-full", "justify-between", "p-8")}>
      <div className={tw("flex", "space-x-12", "items-end", "justify-between")}>
        <img
          style={{
            height: 48, // don't use tailwind here since we want fixed height and rem is dynamic
          }}
          src={isDarkMode ? logoDark : logo}
          alt={"Element Finance"}
        />
        <Tabs
          id="primary-nav"
          large
          onChange={changeTab}
          selectedTabId={activeTab}
          className={tw("w-full")}
        >
          <Tab id={Navigation.EARN} title={<span>{t`Earn`}</span>} />
          <Divider />
          <Tab id={Navigation.TRADE} title={<span>{t`Trade`}</span>} />
          <Divider />
          <Tab
            id={Navigation.PORTFOLIO}
            title={
              <div
                className={tw("flex", "space-x-2", "items-center", "h-full")}
              >
                <span
                  className={tw("flex", "w-full", "justify-between")}
                >{t`Portfolio`}</span>
                {hasPendingTransaction ? (
                  <Spinner size={SpinnerSize.SMALL} />
                ) : null}
              </div>
            }
          />
        </Tabs>
      </div>
      <div className={tw("flex", "flex-1", "space-x-4", "justify-end")}>
        <Button
          minimal
          className={tw("px-6")}
          icon={isDarkMode ? IconNames.FLASH : IconNames.MOON}
          onClick={isDarkMode ? setDarkModeOff : setDarkModeOn}
        />
        <ConnectWalletButton2
          account={account}
          chainId={chainId}
          walletConnectionActive={walletConnectionActive}
        />
        {hamburgerButton}
      </div>
    </div>
  );
}
