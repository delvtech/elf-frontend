import React, { FC, ReactNode } from "react";

import { Classes } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { RouteComponentProps } from "@reach/router";
import { useWeb3React } from "@web3-react/core";
import classNames from "classnames";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { ViewTitle } from "efi-ui/page/ViewTitle/ViewTitle";

interface InvestViewProps extends RouteComponentProps {}

export const InvestView: FC<InvestViewProps> = () => {
  const {
    account,
    active,
    chainId,
    connector,
    library,
  } = useWeb3React<Web3Provider>();

  return (
    <div
      className={tw(
        "flex",
        "flex-col",
        "p-12",
        "h-full",
        "space-y-12",
        "overflow-scroll"
      )}
    >
      {/* page title */}
      <ViewTitle
        title={t`Invest in FYTs and YCs`}
        subtitle={t`Buy and sell Fixed Yield Tokens and Yield Coupons.`}
        account={account}
        active={active}
        chainId={chainId}
        connector={connector}
        library={library}
      />

      {/* Main content */}
      <div className={tw("flex", "flex-col", "flex-1", "space-y-12")}>
        <div
          className={tw(
            "flex",
            "flex-col",
            "space-y-8",
            "w-full",
            "items-center",
            "justify-center"
          )}
        >
          <span
            className={classNames(
              Classes.RUNNING_TEXT,
              Classes.TEXT_MUTED,
              tw("text-base")
            )}
          >
            {"description"}
          </span>
          {"content"}
        </div>
      </div>
    </div>
  );
};
