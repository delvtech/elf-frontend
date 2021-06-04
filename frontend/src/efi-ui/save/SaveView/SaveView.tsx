import { CSSProperties, Fragment, ReactElement, useState } from "react";
import { Helmet } from "react-helmet";

import { Button } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Web3Provider } from "@ethersproject/providers";
import { RouteComponentProps } from "@reach/router";
import { useWeb3React } from "@web3-react/core";
import { PrincipalTokenInfo } from "tokenlists/types";
import { t } from "ttag";

import logoDark from "efi-static-assets/logos/svg/logo--dark.svg";
import logo from "efi-static-assets/logos/svg/logo--light.svg";
import tw from "efi-tailwindcss-classnames";
import { EarnCard } from "efi-ui/earn/EarnCard/EarnCard";
import { ViewTitle } from "efi-ui/page/ViewTitle/ViewTitle";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { SaveNavigation } from "efi-ui/save/SaveNavigation/SaveNavigation";
import { SaveNavigationButton } from "efi-ui/save/SaveNavigation/SaveNavigationButton";
import { SavePortfolioList } from "efi-ui/save/SavePortfolioList/SavePortfolioList";
import { useTokensWithBalance } from "efi-ui/token/hooks/useTokensWithBalance";
import { ConnectWalletButton2 } from "efi-ui/wallets/ConnectWalletButton/ConnectWalletButton2";
import { assertNever } from "efi/base/assertNever";
import { isDust } from "efi/coins/isDust";
import { getTokenInfo } from "efi/tokenlists";
import {
  principalTokenInfos,
  trancheContractsByAddress,
} from "efi/tranche/tranches";

import { SaveTab } from "./SaveTab";
import { SaveViewSubtitle } from "./SaveViewSubtitle";

interface EarnViewProps extends RouteComponentProps {}

const maxWidthStyle: CSSProperties = { maxWidth: 672 };
const widthStyle = { width: 672 };

export function SaveView(props: EarnViewProps): ReactElement {
  const {
    account,
    library,
    chainId,
    active: walletConnectionActive,
  } = useWeb3React<Web3Provider>();
  const { isDarkMode, setDarkModeOn, setDarkModeOff } = useDarkMode();

  const [activeTab, setActiveTab] = useState<SaveNavigation>(
    SaveNavigation.SAVE
  );

  const principalTokensWithBalance =
    usePrincipalTokensWithNonDustBalance(account);

  const viewTitleLabel = getViewTitle(activeTab);

  // don't show the link to View Balances if they aren't connected or don't have
  // any balances
  const showPortfolioLink = account && principalTokensWithBalance.length > 0;

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
            title={viewTitleLabel}
            subtitle={<SaveViewSubtitle activeTab={activeTab} />}
          />
          <div
            className={tw("flex", "flex-col", "space-y-4")}
            style={widthStyle}
          >
            {showPortfolioLink ? (
              <SaveTab activeTab={activeTab} onActiveTabChange={setActiveTab} />
            ) : null}

            {activeTab === SaveNavigation.SAVE && (
              <EarnCard library={library} account={account} />
            )}

            {activeTab === SaveNavigation.BALANCES && (
              <SavePortfolioList
                library={library}
                account={account}
                principalTokens={principalTokensWithBalance}
              />
            )}
          </div>
        </div>
      </div>
    </Fragment>
  );
}

function usePrincipalTokensWithNonDustBalance(
  account: string | null | undefined
): PrincipalTokenInfo[] {
  const principalTokenContracts = principalTokenInfos.map(
    ({ address }) => trancheContractsByAddress[address]
  );

  const principalTokensWithBalance = useTokensWithBalance(
    account,
    principalTokenContracts
  );

  const filteredByDust = principalTokensWithBalance.filter(
    ({ balanceOf, token }) => {
      const { decimals } = getTokenInfo(token.address);
      return !isDust(balanceOf, decimals);
    }
  );
  const principalTokensWithNonDustBalance = filteredByDust.map(
    ({ balanceOf, token }) => getTokenInfo<PrincipalTokenInfo>(token.address)
  );

  return principalTokensWithNonDustBalance;
}

function getViewTitle(activeTab: SaveNavigation) {
  switch (activeTab) {
    case SaveNavigation.SAVE:
      return t`The simplest way to grow your crypto.`;

    case SaveNavigation.BALANCES:
      return t`Wallet Overview`;
    default:
      assertNever(activeTab);
  }
}
