import {
  CSSProperties,
  Fragment,
  ReactElement,
  useCallback,
  useState,
} from "react";
import { Helmet } from "react-helmet";

import { Button, Colors, Icon, Intent } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Web3Provider } from "@ethersproject/providers";
import { RouteComponentProps } from "@reach/router";
import { useWeb3React } from "@web3-react/core";
import { t } from "ttag";

import logo from "efi-static-assets/logos/svg/logo--light.svg";
import logoDark from "efi-static-assets/logos/svg/logo--dark.svg";
import tw from "efi-tailwindcss-classnames";
import { SaveBalancesList } from "efi-ui/earn/SaveBalancesList/SaveBalancesList";
import { EarnCard } from "efi-ui/earn/EarnCard/EarnCard";
import { ViewTitle } from "efi-ui/page/ViewTitle/ViewTitle";
import { assertNever } from "efi/base/assertNever";
import { principalTokenInfos } from "efi/tranche/tranches";
import { formatWalletAddress } from "efi/wallets/formatWalletAddress";

import { SaveViewSubtitle } from "./SaveViewSubtitle";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { ChainId, isMainnet } from "efi/ethereum";
import { ConnectWalletDialog } from "efi-ui/wallets/ConnectWalletDialog/ConnectWalletDialog";
import { WalletJazzicon } from "efi-ui/wallets/WalletJazzicon/WalletJazzicon";

interface EarnViewProps extends RouteComponentProps {}

const maxWidthStyle: CSSProperties = { maxWidth: 672 };
const widthStyle = { width: 672 };

export enum SaveNavigation {
  SAVE = "save",
  BALANCES = "balances",
}
const ChainColor: Record<number, string> = {
  [ChainId.GOERLI]: Colors.BLUE4,
  [ChainId.MAINNET]: Colors.GREEN4,
  [ChainId.LOCAL]: Colors.WHITE,
};
export function SaveView(props: EarnViewProps): ReactElement {
  const { account, library, chainId, active } = useWeb3React<Web3Provider>();
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

  const [activeTab, setActiveTab] = useState<SaveNavigation>(
    SaveNavigation.SAVE
  );
  const onActiveTabClick = useCallback(() => {
    switch (activeTab) {
      case SaveNavigation.SAVE:
        setActiveTab(SaveNavigation.BALANCES);
        return;
      case SaveNavigation.BALANCES:
        setActiveTab(SaveNavigation.SAVE);
        return;
      default:
        assertNever(activeTab);
    }
  }, [activeTab]);

  const activeTabLabel = getActiveTabLabel(activeTab);
  const activeTabIcon = getActiveTabIconName(activeTab);
  const viewTitleLabel = getViewTitle(activeTab);
  const viewTitleBottomLabel = getBottomViewTitle(activeTab);
  return (
    <Fragment>
      <Helmet>
        <title>{t`Earn fixed yield from buying at a discount. Exit anytime.`}</title>
      </Helmet>
      <div
        data-testid="earn-view"
        className={tw(
          "flex",
          "flex-col",
          "p-6",
          "h-full",
          "items-center",
          "overflow-scroll"
        )}
      >
        {/* page title */}
        <div className={tw("flex", "w-full", "justify-between")}>
          <img
            style={{
              height: 48, // don't use tailwind here since we want fixed height and rem is dynamic
            }}
            src={isDarkMode ? logoDark : logo}
            alt={t`Element Finance`}
          />
          <div className={tw("flex", "space-x-8", "items-center")}>
            {!account ? (
              <div>
                <Button
                  outlined
                  fill
                  large
                  intent={walletButtonIntent}
                  onClick={onOpenWalletDialog}
                >
                  <span className={tw("text-center")}>
                    {t`Connect wallet to begin`}
                  </span>
                </Button>
              </div>
            ) : (
              <div>
                <Button
                  minimal={!mainnetDanger}
                  icon={<WalletJazzicon size={28} account={account} />}
                  rightIcon={
                    <Icon
                      className={tw("pr-2")}
                      icon={IconNames.DOT}
                      color={connectionStatusColor}
                    />
                  }
                  fill
                  intent={walletButtonIntent}
                  onClick={onOpenWalletDialog}
                >
                  {formatWalletAddress(account)}
                </Button>
              </div>
            )}
          </div>
        </div>

        <div
          className={tw(
            "flex",
            "flex-col",
            "flex-1",
            "space-y-10",
            "pt-10",
            "items-center",
            "text-center"
          )}
          style={maxWidthStyle}
        >
          <ViewTitle
            title={viewTitleLabel}
            bottomTitle={viewTitleBottomLabel}
            subtitle={<SaveViewSubtitle activeTab={activeTab} />}
          />
          <div
            className={tw("flex", "flex-col", "space-y-4")}
            style={widthStyle}
          >
            {account ? (
              <div className={tw("text-right")}>
                <Button
                  minimal
                  large
                  onClick={onActiveTabClick}
                  icon={activeTabIcon}
                >
                  {activeTabLabel}
                </Button>
              </div>
            ) : null}

            {activeTab === SaveNavigation.SAVE && (
              <EarnCard library={library} account={account} />
            )}

            {activeTab === SaveNavigation.BALANCES && (
              <SaveBalancesList
                account={account}
                principalTokens={principalTokenInfos}
              />
            )}
          </div>
        </div>
      </div>
      <ConnectWalletDialog
        isOpen={isWalletDialogOpen}
        onClose={onCloseWalletDialog}
      />
    </Fragment>
  );
}
function getActiveTabLabel(activeTab: SaveNavigation) {
  switch (activeTab) {
    case SaveNavigation.SAVE: {
      return t`View balances`;
    }
    case SaveNavigation.BALANCES:
      return t`Back to Save`;
    default:
      assertNever(activeTab);
  }
}

function getActiveTabIconName(activeTab: SaveNavigation) {
  switch (activeTab) {
    case SaveNavigation.SAVE:
      return IconNames.TH_LIST;
    case SaveNavigation.BALANCES:
      return IconNames.ARROW_LEFT;
    default:
      assertNever(activeTab);
  }
}
function getViewTitle(activeTab: SaveNavigation) {
  switch (activeTab) {
    case SaveNavigation.SAVE:
      return t`Earn fixed yield from buying at a discount.`;

    case SaveNavigation.BALANCES:
      return t`Principal Token balances`;
    default:
      assertNever(activeTab);
  }
}
function getBottomViewTitle(activeTab: SaveNavigation) {
  switch (activeTab) {
    case SaveNavigation.SAVE:
      return t`Exit anytime.`;

    case SaveNavigation.BALANCES:
      return null;
    default:
      assertNever(activeTab);
  }
}
