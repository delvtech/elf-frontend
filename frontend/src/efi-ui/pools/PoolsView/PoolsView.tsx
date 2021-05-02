import React, { Fragment, ReactElement } from "react";
import { Helmet } from "react-helmet";

import { Web3Provider } from "@ethersproject/providers";
import { RouteComponentProps } from "@reach/router";
import { useWeb3React } from "@web3-react/core";
import { Signer } from "ethers";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { ViewTitle } from "efi-ui/page/ViewTitle/ViewTitle";
import { PoolsTable } from "efi-ui/pools/PoolsTable/PoolsTable";

interface PoolsViewProps extends RouteComponentProps {}

export function PoolsView(props: PoolsViewProps): ReactElement {
  const { library, account } = useWeb3React<Web3Provider>();

  const signer = account ? (library?.getSigner(account) as Signer) : undefined;
  const isYieldPage = props.path === "yield";
  const title = isYieldPage ? "Yield Token Pools" : "Principal Token Pools";
  const subtitle = isYieldPage
    ? "Trade your Yield Tokens, or provide liquidity by staking in Element pools."
    : "Trade your Principal, or provide liquidity by staking in Element pools.";

  return (
    <Fragment>
      <Helmet>
        <title>{t`Pools`}</title>
      </Helmet>
      <div
        data-testid="pools-view"
        className={tw(
          "flex",
          "flex-col",
          "p-12",
          "pt-24",
          "lg:pt-12",
          "h-full",
          "space-y-12",
          "items-center",
          "overflow-scroll"
        )}
      >
        <ViewTitle
          title={title}
          subtitle={subtitle}
          className={tw("text-center")}
        />

        <PoolsTable
          signerOrProvider={signer}
          className={tw("w-full")}
          isYieldPools={isYieldPage}
        />
      </div>
    </Fragment>
  );
}
