import { ReactElement } from "react";

import {
  AnchorButton,
  Button,
  Divider,
  Intent,
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
import { ExperimentalBanner } from "efi-ui/page/ExperimentalBanner/ExperimentalBanner";
import { useNavigation } from "efi-ui/app/navigation/hooks/useTab";
import { Navigation } from "efi-ui/app/navigation/navigation";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { usePendingTransactionPref } from "efi-ui/transactions/usePendingTransactionPref/usePendingTransactionPref";
import { ConnectWalletButton } from "efi-ui/wallets/ConnectWalletButton/ConnectWalletButton";
import { AddressesJson } from "efi/addresses";
import { isLocalnet, isGoerli, isMainnet } from "efi/ethereum";

// assume testnet by default (goerli)
let saveAppUrl = "https://save-testnet.element.fi";
if (isLocalnet(AddressesJson.chainId)) {
  // TODO: Get this from the env, but for now assume in dev that the Save UI is @ :3001
  saveAppUrl = "http://localhost:3001";
}
if (isGoerli(AddressesJson.chainId)) {
  saveAppUrl = "https://save-testnet.element.fi";
} else if (isMainnet(AddressesJson.chainId)) {
  saveAppUrl = "https://save.element.fi";
}
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
      <ExperimentalBanner />
      <div
        className={tw(
          "flex",
          "w-full",
          "justify-between",
          "p-8",
          "space-x-16",
          "items-end"
        )}
      >
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
              </div>
            }
          />
        </Tabs>
        {hasPendingTransaction ? (
          <div
            className={tw("items-center", "flex", "ml-2", "mt-3", "space-x-2")}
          >
            {hasPendingTransaction ? (
              <Spinner size={SpinnerSize.SMALL} />
            ) : null}
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
        <div className={tw("flex", "space-x-4", "items-center")}>
          <Button
            minimal
            className={tw("px-6")}
            icon={isDarkMode ? IconNames.FLASH : IconNames.MOON}
            onClick={isDarkMode ? setDarkModeOff : setDarkModeOn}
          />
          <ConnectWalletButton
            account={account}
            chainId={chainId}
            walletConnectionActive={walletConnectionActive}
          />
          <div className={tw("flex", "flex-shrink-0")}>
            <AnchorButton
              href={saveAppUrl}
              large
              outlined
              intent={Intent.PRIMARY}
              icon={IconNames.SHARE}
            >{t`Save UI`}</AnchorButton>
          </div>
          {hamburgerButton}
        </div>
      </div>
    </div>
  );
}
