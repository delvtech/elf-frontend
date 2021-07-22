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
import classNames from "classnames";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { useNavigation } from "efi-ui/app/navigation/hooks/useTab";
import { Navigation } from "efi-ui/app/navigation/navigation";
import { ExperimentalBanner } from "efi-ui/page/ExperimentalBanner/ExperimentalBanner";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { usePendingTransactionPref } from "efi-ui/transactions/usePendingTransactionPref/usePendingTransactionPref";
import { ConnectWalletButton } from "efi-ui/wallets/ConnectWalletButton/ConnectWalletButton";
import { ElementLogo } from "efi-ui/base/ElementLogo";
import { AppMenuButton } from "efi-ui/app/navigation/AppMenuButton/AppMenuButton";

interface EarnAppHeaderProps {
  chainId: number | undefined;
  account: string | null | undefined;
  active: boolean;
  connectorName: string | undefined;
  deactivate: () => void;
  hamburgerButton: ReactElement;
}

export function EarnAppHeader({
  account,
  active: walletConnectionActive,
  chainId,
  hamburgerButton,
}: EarnAppHeaderProps): ReactElement {
  const { activeTab, changeTab } = useNavigation();
  const { isDarkMode, setDarkModeOff, setDarkModeOn } = useDarkMode();
  const { transactionHash, clearPendingTransactionPref } =
    usePendingTransactionPref();
  const hasPendingTransaction = !!transactionHash;

  return (
    <div className={tw("flex", "w-full", "flex-col")}>
      <ExperimentalBanner className={tw("hidden", "lg:flex")} />

      {/* Mobile */}
      <div className={tw("flex", "lg:hidden", "w-full", "p-2")}>
        <AppMenuButton />
      </div>
      <ExperimentalBanner className={tw("flex", "lg:hidden", "text-xs")} />

      {/* Desktop */}
      <div className={tw("hidden", "lg:flex", "w-full", "p-8")}>
        <div className={tw("flex", "w-full", "space-x-4", "items-end")}>
          <ElementLogo
            height={48}
            isDarkMode={isDarkMode}
            className={tw("mr-16", "hidden", "md:block")}
          />
          <Tabs
            id="primary-nav"
            large
            onChange={changeTab}
            selectedTabId={activeTab}
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
          {hasPendingTransaction ? (
            <div className={tw("flex", "mb-1")}>
              <Button
                outlined
                small
                icon={IconNames.CROSS}
                onClick={clearPendingTransactionPref}
              >
                {t`Clear spinner`}
              </Button>
            </div>
          ) : null}
        </div>

        <div
          className={classNames(
            tw(
              "flex-shrink-0",
              "flex-no-wrap",
              "space-x-4",
              "items-center",
              "hidden",
              "md:flex"
            ),
            { "bp3-dark": isDarkMode }
          )}
        >
          <Button
            minimal
            className={tw("px-6", "py-3")}
            icon={isDarkMode ? IconNames.FLASH : IconNames.MOON}
            onClick={isDarkMode ? setDarkModeOff : setDarkModeOn}
          />

          <ConnectWalletButton
            account={account}
            chainId={chainId}
            walletConnectionActive={walletConnectionActive}
          />
        </div>
        {hamburgerButton}
      </div>
    </div>
  );
}
