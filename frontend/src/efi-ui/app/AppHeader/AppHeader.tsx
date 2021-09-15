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
import { jt, t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { AppMenuButton } from "efi-ui/app/AppMenuButton/AppMenuButton";
import { useNavigation } from "efi-ui/app/navigation/hooks/useTab";
import { Navigation } from "efi-ui/app/navigation/navigation";
import { ElementLogo } from "efi-ui/base/ElementLogo";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { usePendingTransactionPref } from "efi-ui/transactions/usePendingTransactionPref/usePendingTransactionPref";
import { ConnectWalletButton } from "efi-ui/wallets/ConnectWalletButton/ConnectWalletButton";

interface AppHeaderProps {
  chainId: number | undefined;
  account: string | null | undefined;
  active: boolean;
  connectorName: string | undefined;
  deactivate: () => void;
  hamburgerButton: ReactElement;
}

const fixedYieldLink = (
  <a
    key="fixed-yield-link"
    href="https://medium.com/element-finance/fixed-rate-interest-markets-a-casual-users-journey-through-fixed-rate-interest-using-element-50f420df1859"
    target="_noreferrer"
  >{t`Fixed Yield`}</a>
);

export function AppHeader({
  account,
  active: walletConnectionActive,
  chainId,
  hamburgerButton,
}: AppHeaderProps): ReactElement {
  const { activeTab, changeTab } = useNavigation();
  const { isDarkMode, setDarkModeOff, setDarkModeOn } = useDarkMode();
  const { transactionHash, clearPendingTransactionPref } =
    usePendingTransactionPref();
  const hasPendingTransaction = !!transactionHash;

  const isFixedRatesPageHACK = activeTab === Navigation.FIXED_RATES;

  return (
    <div className={tw("flex", "w-full", "flex-col")}>
      {/* Mobile */}
      <div
        className={tw(
          "flex",
          "lg:hidden",
          "w-full",
          "p-2",
          "items-center",
          "justify-between"
        )}
      >
        <AppMenuButton />
        {isFixedRatesPageHACK ? (
          <span>{jt`Learn more about ${fixedYieldLink}`}</span>
        ) : null}
      </div>

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
            {/*
             Blueprint Tabs does stuff w/ children so we can't use Fragments, hence two ternarys
             */}
            {isFixedRatesPageHACK ? (
              <Tab
                id={Navigation.FIXED_RATES}
                title={<span>{t`Fixed Rates`}</span>}
              />
            ) : null}
            {isFixedRatesPageHACK ? <Divider /> : null}

            <Tab
              id={Navigation.EARN}
              title={
                <span>{isFixedRatesPageHACK ? t`Add Liquidity` : t`Earn`}</span>
              }
            />
            <Divider />
            <Tab
              id={Navigation.TRADE}
              title={<span>{isFixedRatesPageHACK ? t`Pools` : t`Trade`}</span>}
            />
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
          {isFixedRatesPageHACK ? (
            <span>{jt`Learn more about ${fixedYieldLink}`}</span>
          ) : null}
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
