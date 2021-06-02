import {
  CSSProperties,
  Fragment,
  ReactElement,
  useCallback,
  useState,
} from "react";
import { Helmet } from "react-helmet";

import { Button } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Web3Provider } from "@ethersproject/providers";
import { RouteComponentProps } from "@reach/router";
import { useWeb3React } from "@web3-react/core";
import { t } from "ttag";

import logoDark from "efi-static-assets/logos/svg/logo--dark.svg";
import logo from "efi-static-assets/logos/svg/logo--light.svg";
import tw from "efi-tailwindcss-classnames";
import { EarnCard } from "efi-ui/earn/EarnCard/EarnCard";
import { SaveBalancesList } from "efi-ui/earn/SaveBalancesList/SaveBalancesList";
import { ViewTitle } from "efi-ui/page/ViewTitle/ViewTitle";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { assertNever } from "efi/base/assertNever";
import { principalTokenInfos } from "efi/tranche/tranches";

import { SaveViewSubtitle } from "./SaveViewSubtitle";
import { ConnectWalletButton2 } from "efi-ui/wallets/ConnectWalletButton/ConnectWalletButton2";

interface EarnViewProps extends RouteComponentProps {}

const maxWidthStyle: CSSProperties = { maxWidth: 672 };
const widthStyle = { width: 672 };

export enum SaveNavigation {
  SAVE = "save",
  BALANCES = "balances",
}

export function SaveView(props: EarnViewProps): ReactElement {
  const {
    account,
    library,
    chainId,
    active: walletConnectionActive,
  } = useWeb3React<Web3Provider>();
  const { isDarkMode } = useDarkMode();

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
          <ConnectWalletButton2
            account={account}
            chainId={chainId}
            walletConnectionActive={walletConnectionActive}
          />
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
