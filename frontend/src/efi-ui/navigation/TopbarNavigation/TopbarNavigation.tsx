import { ReactElement, useCallback, useState } from "react";

import {
  Button,
  Colors,
  Icon,
  Intent,
  Navbar,
  NavbarGroup,
  Tab,
  Tabs,
} from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Popover2, Tooltip2 } from "@blueprintjs/popover2";
import { t } from "ttag";

import logoDark from "efi-static-assets/logos/svg/logo--dark.svg";
import logo from "efi-static-assets/logos/svg/logo--light.svg";
import tw from "efi-tailwindcss-classnames";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { Navigation } from "efi-ui/navigation/navigation";
import { DarkModeSwitch } from "efi-ui/prefs/DarkModeSwitch/DarkModeSwitch";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { ConnectWalletDialog } from "efi-ui/wallets/ConnectWalletDialog/ConnectWalletDialog";
import { WalletJazzicon } from "efi-ui/wallets/WalletJazzicon/WalletJazzicon";
import { formatChainName } from "efi/crypto/formatChainName";
import { ChainId, isMainnet } from "efi/ethereum";
import { formatWalletAddress } from "efi/wallets/formatWalletAddress";

interface TopbarNavigationProps {
  chainId: number | undefined;
  account: string | null | undefined;
  active: boolean;
  connectorName: string | undefined;
  deactivate: () => void;
  isDarkMode: boolean;
  activeTab: Navigation;
  changeTab: (tabId: Navigation) => void;
}
const tabStyle = {
  paddingRight: 64,
  paddingLeft: 64,
  paddingTop: 24,
  paddingBottom: 24,
};

const ChainColor: Record<number, string> = {
  [ChainId.GOERLI]: Colors.BLUE4,
  [ChainId.MAINNET]: Colors.GREEN4,
  [ChainId.LOCAL]: Colors.WHITE,
};
export function TopbarNavigation({
  activeTab,
  changeTab,
  account,
  active,
  chainId,
}: TopbarNavigationProps): ReactElement {
  const { isDarkMode } = useDarkMode();
  const [isWalletDialogOpen, setWalletDialogOpen] = useState(false);
  const mainnetDanger =
    !!chainId && isMainnet(chainId) && process.env.NODE_ENV !== "production";

  let walletButtonIntent: Intent = Intent.NONE;
  if (!account) {
    walletButtonIntent = Intent.WARNING;
  } else if (mainnetDanger) {
    walletButtonIntent = Intent.DANGER;
  }
  const connectionStatusColor =
    active && !!chainId ? ChainColor[chainId] : Colors.RED4;
  const onCloseWalletDialog = useCallback(() => setWalletDialogOpen(false), []);
  const onOpenWalletDialog = useCallback(() => setWalletDialogOpen(true), []);

  return (
    <div
      className={tw(
        "lg:hidden",
        "h-16",
        "flex",
        "flex-shrink-0",
        "fixed",
        "w-full",
        "z-20"
      )}
    >
      <Navbar className={tw("flex", "justify-between")}>
        <NavbarGroup>
          <img
            style={{
              height: 32, // don't use tailwind here since we want fixed height and rem is dynamic
            }}
            src={isDarkMode ? logoDark : logo}
            alt={t`Element Finance`}
          />
        </NavbarGroup>
        <NavbarGroup>
          {!account ? (
            <div>
              <Button
                minimal={!mainnetDanger}
                fill
                intent={walletButtonIntent}
                onClick={onOpenWalletDialog}
              >
                <span className={tw("text-center")}>
                  {t`Connect wallet to begin`}
                </span>
              </Button>
            </div>
          ) : (
            <Tooltip2
              inheritDarkTheme={false}
              content={
                <div className={tw("flex", "space-x-4", "items-center")}>
                  <LabeledText
                    className={tw("text-center")}
                    text={
                      <span>
                        <Icon
                          className={tw("pr-2")}
                          icon={IconNames.DOT}
                          color={connectionStatusColor}
                        />
                        {formatWalletAddress(account)}
                      </span>
                    }
                    label={
                      <span className={tw("text-gray-500")}>
                        {formatChainName(active, chainId)}
                      </span>
                    }
                  />
                </div>
              }
            >
              <Button
                minimal={!mainnetDanger}
                icon={<WalletJazzicon size={28} account={account} />}
                fill
                intent={walletButtonIntent}
                onClick={onOpenWalletDialog}
              >
                {formatWalletAddress(account)}
              </Button>
            </Tooltip2>
          )}
        </NavbarGroup>
        <NavbarGroup>
          <DarkModeSwitch />
          <Popover2
            content={
              <Tabs
                large
                vertical
                id="primary-nav-mobile"
                selectedTabId={activeTab}
                onChange={changeTab}
              >
                <Tab
                  id={Navigation.EARN}
                  className={tw("text-center")}
                  style={tabStyle}
                  title={t`Earn`}
                />
                <Tab
                  id={Navigation.DEPOSIT}
                  className={tw("text-center")}
                  style={tabStyle}
                  title={t`Deposit`}
                />
                <Tab
                  id={Navigation.TRADE}
                  className={tw("text-center")}
                  style={tabStyle}
                  title={t`Trade`}
                />
                <Tab
                  id={Navigation.PORTFOLIO}
                  className={tw("text-center")}
                  style={tabStyle}
                  title={t`Portfolio`}
                />
                <Tab
                  id={Navigation.RESOURCES}
                  className={tw("text-center")}
                  style={tabStyle}
                  title={t`Resources`}
                />
              </Tabs>
            }
          >
            <Button large minimal icon={IconNames.MENU}></Button>
          </Popover2>
        </NavbarGroup>
      </Navbar>
      <ConnectWalletDialog
        isOpen={isWalletDialogOpen}
        onClose={onCloseWalletDialog}
      />
    </div>
  );
}
