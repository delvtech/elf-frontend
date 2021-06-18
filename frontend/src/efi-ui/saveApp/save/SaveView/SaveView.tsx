import { CSSProperties, Fragment, ReactElement, useCallback } from "react";
import { Helmet } from "react-helmet";

import { Button } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Web3Provider } from "@ethersproject/providers";
import { navigate, RouteComponentProps } from "@reach/router";
import { useWeb3React } from "@web3-react/core";
import { jt, t } from "ttag";

import logoDark from "efi-static-assets/logos/svg/logo--dark.svg";
import logo from "efi-static-assets/logos/svg/logo--light.svg";
import tw from "efi-tailwindcss-classnames";
import { ViewTitle } from "efi-ui/page/ViewTitle/ViewTitle";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { SaveNavigationButton } from "efi-ui/saveApp/navigation/SaveNavigation/SaveNavigationButton";
import { SaveCard } from "efi-ui/saveApp/save/SaveCard/SaveCard";
import { ConnectWalletButton2 } from "efi-ui/wallets/ConnectWalletButton/ConnectWalletButton2";

interface EarnViewProps extends RouteComponentProps {}

const maxWidthStyle: CSSProperties = { maxWidth: 672 };
const widthStyle = { width: 672 };

const fixedYieldLink = (
  <a
    key="fixed-yield-link"
    href={
      "https://medium.com/element-finance/fixed-rate-interest-markets-a-casual-users-journey-through-fixed-rate-interest-using-element-50f420df1859"
    }
    target="_noreferrer"
  >
    {t`Read more about Fixed Yield.`}
  </a>
);

export function SaveView(props: EarnViewProps): ReactElement {
  const {
    account,
    library,
    chainId,
    active: walletConnectionActive,
  } = useWeb3React<Web3Provider>();
  const { isDarkMode, setDarkModeOn, setDarkModeOff } = useDarkMode();

  const goToPortfolio = useCallback(() => navigate("/portfolio"), []);
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
          <div className={tw("flex", "space-x-4")}>
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
            <SaveNavigationButton />
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
            title={t`The simplest way to grow your crypto.`}
            subtitle={jt`No minimums, no withdrawal penalties, no lockups. Just fixed rate interest. ${fixedYieldLink}`}
          />
          <div
            className={tw("flex", "flex-col", "space-y-4")}
            style={widthStyle}
          >
            <div className={tw("text-right")}>
              <Button
                minimal
                large
                onClick={goToPortfolio}
                icon={IconNames.TH_LIST}
              >
                {t`View balances`}
              </Button>
            </div>

            <SaveCard library={library} account={account} />
          </div>
        </div>
      </div>
    </Fragment>
  );
}
