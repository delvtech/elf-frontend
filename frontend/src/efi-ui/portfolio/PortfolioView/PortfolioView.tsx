import React, { FC } from "react";

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

        <div className={tw("flex", "space-x-12", "w-full", "h-full")}>
          {/* FYTs */}
          <div
            className={tw("flex", "flex-col", "space-y-2", "h-full", "flex-1")}
          >
            <H3>{t`Fixed Yield Tokens (FYTs)`}</H3>
            <Card className={tw("flex", "flex-1", "p-10")}>
              {hasFYTsInWallet ? (
                <FYTTable />
              ) : (
                <NonIdealState
                  icon={IconNames.BANK_ACCOUNT}
                  description={t`This wallet does not contain any Fixed Yield Tokens.`}
                  action={
                    <Button
                      outlined
                      onClick={() => {
                        changeTab(Navigation.POOLS);
                      }}
                    >{t`Go to Mint`}</Button>
                  }
                />
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
