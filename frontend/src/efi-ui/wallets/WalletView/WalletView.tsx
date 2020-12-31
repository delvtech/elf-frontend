import {
  Button,
  Card,
  Classes,
  H2,
  H3,
  NonIdealState,
} from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Web3Provider } from "@ethersproject/providers";
import { RouteComponentProps } from "@reach/router";
import { useWeb3React } from "@web3-react/core";
import classNames from "classnames";
import React, { FC } from "react";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { useChangeTab } from "efi-ui/navigation/hooks/useChangeTab";
import { Navigation } from "efi-ui/navigation/navigation";
import WalletSummaryPane from "efi-ui/wallets/WalletSummaryPane/WalletSummaryPane";

interface WalletViewProps extends RouteComponentProps {}
export const WalletView: FC<WalletViewProps> = () => {
  const { account } = useWeb3React<Web3Provider>();
  const changeTab = useChangeTab();

  return (
    <div
      className={tw("flex", "p-12", "h-full", "space-x-12", "overflow-scroll")}
    >
      {/* Main content */}
      <div className={tw("flex", "flex-col", "flex-1", "space-y-10")}>
        {/* page title */}
        <div className={tw("flex", "flex-col", "justify-start")}>
          <H2 className={tw("mb-4")}>{t`Investment summary`}</H2>
          <span
            className={classNames(
              Classes.RUNNING_TEXT,
              Classes.TEXT_MUTED,
              tw("text-base")
            )}
          >
            {t`Wallet address: ${account}`}
          </span>
        </div>
        <div className={tw("flex", "space-x-8", "w-full", "h-full")}>
          {/* Pools */}
          <div
            className={tw("flex", "flex-col", "space-y-2", "h-full", "flex-1")}
          >
            <H3>{t`Pools`}</H3>
            <Card className={tw("flex", "flex-1")}>
              <NonIdealState
                icon={IconNames.CUBE_ADD}
                description={t`This wallet is not invested in any Pools`}
                action={
                  <Button
                    outlined
                    onClick={() => {
                      changeTab(Navigation.POOLS);
                    }}
                  >{t`Go to Pools`}</Button>
                }
              />
            </Card>
          </div>

          {/* FYTs */}
          <div
            className={tw("flex", "flex-col", "space-y-2", "h-full", "flex-1")}
          >
            <H3>{t`FYTs`}</H3>
            <Card className={tw("flex", "flex-1")}>
              <NonIdealState
                icon={IconNames.TRACTOR}
                description={t`FYTs are under construction`}
                action={<Button outlined disabled>{t`More about FYTs`}</Button>}
              />
            </Card>
          </div>
        </div>

        {/* Transaction history */}
        <div className={tw("flex", "flex-col", "space-y-2", "h-full")}>
          <H3>{t`Transaction history`}</H3>
          <Card className={tw("flex", "flex-1")}>
            {" "}
            <NonIdealState
              icon={IconNames.FLAG}
              description={t`Transaction history is empty`}
            />
          </Card>
        </div>
      </div>
      {/* Right hand side */}
      <div className={tw("hidden", "lg:block", "h-full", "w-3/10")}>
        <WalletSummaryPane />
      </div>
    </div>
  );
};
