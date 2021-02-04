import React, { FC, Fragment, useCallback } from "react";

import { Card, H3 } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { RouteComponentProps } from "@reach/router";
import { useWeb3React } from "@web3-react/core";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { useChangeTab } from "efi-ui/navigation/hooks/useChangeTab";
import { Navigation } from "efi-ui/navigation/navigation";
import { ViewTitle } from "efi-ui/page/ViewTitle/ViewTitle";
import { FYTTable } from "efi-ui/portfolio/FYTTable/FYTTable";
import { PortfolioViewSubtitle } from "efi-ui/portfolio/PortfolioView/PortfolioViewSubtitle";

import { NoFYTsInWalletNonIdealState } from "../../wallets/NoFYTsInWalletNonIdealState/NoFYTsInWalletNonIdealState";
import { NoWalletConnectedNonIdealState } from "../../wallets/NoWalletConnectedNonIdealState/NoWalletConnectedNonIdealState";
import { NoYCsInWalletNonIdealState } from "../../wallets/NoYCsInWalletNonIdealState/NoYCsInWalletNonIdealState";

interface PortfolioViewProps extends RouteComponentProps {}
export const PortfolioView: FC<PortfolioViewProps> = () => {
  const {
    account,
    active,
    chainId,
    connector,
    library,
  } = useWeb3React<Web3Provider>();

  const changeTab = useChangeTab();
  const goToMint = useCallback(() => changeTab(Navigation.MINT), [changeTab]);

  // TODO: Stubbed values
  const hasFYTsInWallet = !!account;
  const hasYCsInWallet = !account;

  return (
    <div
      data-testid="portfolio-view"
      className={tw("flex", "p-12", "h-full", "space-x-12", "overflow-scroll")}
    >
      {/* Main content */}
      <div className={tw("flex", "flex-col", "flex-1", "space-y-8")}>
        <ViewTitle
          title={t`Portfolio`}
          subtitle={<PortfolioViewSubtitle account={account} />}
          account={account}
          active={active}
          chainId={chainId}
          connector={connector}
          library={library}
        />

        <div
          className={tw("flex", "flex-col", "space-y-12", "w-full", "h-full")}
        >
          {!account ? (
            <Card className={tw("flex", "flex-1", "p-10")}>
              <NoWalletConnectedNonIdealState />
            </Card>
          ) : (
            <Fragment>
              {/* FYTs */}
              <div
                className={tw(
                  "flex",
                  "flex-col",
                  "space-y-2",
                  "h-full",
                  "flex-1"
                )}
              >
                <H3>{t`Fixed Yield Tokens (2)`}</H3>
                <Card className={tw("flex", "flex-1", "p-10")}>
                  {hasFYTsInWallet ? (
                    <FYTTable />
                  ) : (
                    <NoFYTsInWalletNonIdealState onGoToMint={goToMint} />
                  )}
                </Card>
              </div>

              {/* YCs */}
              <div
                className={tw(
                  "flex",
                  "flex-col",
                  "space-y-2",
                  "h-full",
                  "flex-1"
                )}
              >
                <H3>{t`Yield Coupons (2)`}</H3>
                <Card className={tw("flex", "flex-1", "p-10")}>
                  {hasYCsInWallet ? (
                    <FYTTable />
                  ) : (
                    <NoYCsInWalletNonIdealState onGoToMint={goToMint} />
                  )}
                </Card>
              </div>
            </Fragment>
          )}
        </div>
      </div>
    </div>
  );
};
