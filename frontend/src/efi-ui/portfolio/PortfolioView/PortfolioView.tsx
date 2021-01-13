import React, { FC, Fragment } from "react";

import { Button, Card, H3, NonIdealState } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Web3Provider } from "@ethersproject/providers";
import { RouteComponentProps } from "@reach/router";
import { useWeb3React } from "@web3-react/core";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { useChangeTab } from "efi-ui/navigation/hooks/useChangeTab";
import { Navigation } from "efi-ui/navigation/navigation";

import { PortfolioViewTitle } from "./PortfolioViewTitle";
import { FYTTable } from "efi-ui/portfolio/FYTTable/FYTTable";

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

  // TODO: Stubbed values
  const hasFYTsInWallet = !!account;
  const hasYCsInWallet = !!account;

  return (
    <div
      className={tw("flex", "p-12", "h-full", "space-x-12", "overflow-scroll")}
    >
      {/* Main content */}
      <div className={tw("flex", "flex-col", "flex-1", "space-y-8")}>
        <PortfolioViewTitle
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
                    <NoFYTsInWalletNonIdealState changeTab={changeTab} />
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
                    <NoYCsInWalletNonIdealState changeTab={changeTab} />
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

const NoFYTsInWalletNonIdealState: FC<{
  changeTab: (tabId: Navigation) => void;
}> = ({ changeTab }) => {
  return (
    <NonIdealState
      icon={IconNames.BANK_ACCOUNT}
      description={t`This wallet does not contain any Fixed Yield Tokens.`}
      action={
        <Button
          outlined
          large
          onClick={() => {
            changeTab(Navigation.MINT);
          }}
        >{t`Go to Mint`}</Button>
      }
    />
  );
};

const NoYCsInWalletNonIdealState: FC<{
  changeTab: (tabId: Navigation) => void;
}> = ({ changeTab }) => {
  return (
    <NonIdealState
      icon={IconNames.BANK_ACCOUNT}
      description={t`This wallet does not contain any Yield Coupons.`}
      action={
        <Button
          outlined
          large
          onClick={() => {
            changeTab(Navigation.MINT);
          }}
        >{t`Go to Mint`}</Button>
      }
    />
  );
};

const NoWalletConnectedNonIdealState: FC<{}> = () => {
  const description = (
    <div
      className={tw(
        "md:text-left",
        "flex",
        "flex-col",
        "justify-center",
        "items-center",
        "gap-y-5"
      )}
    >
      <span>{t`Connecting your wallet lets Element.fi do a few things:`}</span>
      <ul className={tw("w-9/12", "list-disc", "text-left")}>
        <li className={tw("mb-3")}>
          {t`View and display your crypto balances`}
        </li>
        <li>{t`Initialize Ethereum transactions on your behalf`}</li>
      </ul>
    </div>
  );

  return (
    <NonIdealState
      icon={IconNames.SEND_TO_GRAPH}
      title={t`No wallet connected`}
      description={description}
      action={
        <Button
          outlined
          large
          onClick={() => {}}
        >{t`Connect wallet to begin`}</Button>
      }
    />
  );
};
