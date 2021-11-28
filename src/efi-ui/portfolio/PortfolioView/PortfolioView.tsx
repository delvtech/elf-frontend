import { Fragment, ReactElement } from "react";
import { Helmet } from "react-helmet";

import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { useIsTailwindLargeScreen } from "efi-ui/base/mediaBreakpoints";

import { PortfolioViewOriginal } from "./PortfolioViewOriginal";
import { PortfolioViewSmallScreen } from "./PortfolioViewSmallScreen";

interface PortfolioViewProps {}

export function PortfolioView(unusedProps: PortfolioViewProps): ReactElement {
  const {
    account,
    library,
    active: walletConnectionActive,
    chainId,
    connector,
  } = useWeb3React<Web3Provider>();
  const isLargeScreen = useIsTailwindLargeScreen();

  return (
    <Fragment>
      <Helmet>
        <title>{t`Portfolio | Element.fi`}</title>
      </Helmet>
      <div
        data-testid="portfolio-view"
        className={tw(
          "flex",
          "flex-col",
          "w-full",
          "h-full",
          "space-y-6",
          "items-center"
        )}
      >
        {isLargeScreen ? (
          // Large screen version has tab navigation to toggle between
          // Principal, Yield, and LP Tokens
          <PortfolioViewOriginal
            account={account}
            chainId={chainId}
            library={library}
            connector={connector}
            walletConnectionActive={walletConnectionActive}
          />
        ) : (
          // Small screen version has a filterable list of all Principal, Yield, and LP Tokens
          <PortfolioViewSmallScreen
            account={account}
            chainId={chainId}
            library={library}
            connector={connector}
            walletConnectionActive={walletConnectionActive}
          />
        )}
      </div>
    </Fragment>
  );
}
