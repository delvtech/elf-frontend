import { Fragment, ReactElement, useState } from "react";
import { Helmet } from "react-helmet";

import { Classes, H2 } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { RouteComponentProps } from "@reach/router";
import { useWeb3React } from "@web3-react/core";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { LiquidityPositionPortfolio } from "efi-ui/portfolio/LiquidityPositionPortfolio/LiquidityPositionPortfolio";
import {
  PortfolioTabId,
  PortfolioTabs,
} from "efi-ui/portfolio/PortfolioTabs/PortfolioTabs";
import { PrincipalTokenPortfolio } from "efi-ui/portfolio/PrincipalTokenPortfolio/PrincipalTokenPortfolio";
import { YieldTokenPortfolio } from "efi-ui/portfolio/YieldTokenPortfolio/YieldTokenPortfolio";
import { formatWalletAddress } from "efi/wallets/formatWalletAddress";

import styles from "./styles.module.css";
import { assertNever } from "efi/base/assertNever";

interface PortfolioViewProps extends RouteComponentProps {}

export function PortfolioView(props: PortfolioViewProps): ReactElement {
  const {
    account,
    library,
    active: walletConnectionActive,
    chainId,
    connector,
  } = useWeb3React<Web3Provider>();

  const [activePortfolioTabId, setActivePortfolioTab] = useState(
    PortfolioTabId.PRINCIPAL_TOKENS
  );

  return (
    <Fragment>
      <Helmet>
        <title>{t`Portfolio`}</title>
      </Helmet>
      <div
        data-testid="portfolio-view"
        className={tw("flex", "w-full", "h-full", "space-x-12", "items-center")}
      >
        {/* Main content */}
        <div
          className={tw("flex", "flex-col", "h-full", "flex-1", "items-center")}
        >
          <div
            className={tw(
              "flex",
              "flex-col",
              "w-full",
              "space-y-6",
              "items-center",
              "mb-6"
            )}
          >
            {account ? (
              <H2 className={tw("text-center")}>
                {t`Portfolio `}{" "}
                <a
                  className={styles.accountLink}
                  href={`https://etherscan.io/address/${account}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className={Classes.TEXT_MUTED}>{`(${formatWalletAddress(
                    account
                  )})`}</span>
                </a>
              </H2>
            ) : null}

            {account ? (
              <PortfolioTabs
                onChangeTab={setActivePortfolioTab}
                activePortfolioTabId={activePortfolioTabId}
              />
            ) : null}
          </div>

          <div className={tw("flex", "w-full", "h-full")}>
            <div
              className={tw(
                "h-full",
                "w-full",
                "flex",
                "flex-col",
                "space-y-10",
                "lg:flex-row",
                "lg:space-y-0",
                "lg:space-x-10"
              )}
            >
              <div className={tw("flex", "flex-1", "w-full")}>
                {(() => {
                  switch (activePortfolioTabId) {
                    case PortfolioTabId.PRINCIPAL_TOKENS:
                      return (
                        <PrincipalTokenPortfolio
                          chainId={chainId}
                          library={library}
                          account={account}
                        />
                      );
                    case PortfolioTabId.YIELD_TOKENS:
                      return (
                        <YieldTokenPortfolio
                          chainId={chainId}
                          library={library}
                          connector={connector}
                          account={account}
                          walletConnectionActive={walletConnectionActive}
                        />
                      );
                    case PortfolioTabId.LP_POSITIONS:
                      return (
                        <LiquidityPositionPortfolio
                          library={library}
                          connector={connector}
                          account={account}
                        />
                      );
                    default:
                      assertNever(activePortfolioTabId);
                  }
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
}
