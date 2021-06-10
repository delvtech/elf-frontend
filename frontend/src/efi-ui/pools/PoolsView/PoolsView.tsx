import React, { Fragment, ReactElement, useState } from "react";
import { Helmet } from "react-helmet";

import { Web3Provider } from "@ethersproject/providers";
import { RouteComponentProps } from "@reach/router";
import { useWeb3React } from "@web3-react/core";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { ViewTitle } from "efi-ui/page/ViewTitle/ViewTitle";
import { PoolsTable } from "efi-ui/pools/PoolsTable/PoolsTable";
import { useSigner } from "efi-ui/provider/useBlockFromTag/useSigner/useSigner";
import { Tab, Tabs } from "@blueprintjs/core";

type TermToken = "principal" | "yield";
interface PoolsViewProps extends RouteComponentProps {}

export function PoolsView(props: PoolsViewProps): ReactElement {
  const { library, account } = useWeb3React<Web3Provider>();
  const signer = useSigner(account, library);

  const [activeTab, setActiveTab] = useState<TermToken>("principal");

  const title =
    activeTab === "yield" ? t`Yield Token Pools` : t`Principal Token Pools`;
  const subtitle =
    activeTab === "yield"
      ? t`Buy and sell yield tokens or provide liquidity by staking in Element yield pools.`
      : t`Buy and sell principal or provide liquidity by staking in Element principal pools.`;

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

        <Tabs
          large
          selectedTabId={activeTab}
          onChange={setActiveTab as (newTabId: TermToken) => void}
        >
          <Tab id={"principal"} title={t`Principal Tokens`} />
          <Tab id={"yield"} title={t`Yield Tokens`} />
        </Tabs>

        <PoolsTable
          signerOrProvider={signer}
          className={tw("w-full")}
          isYieldPools={activeTab === "yield"}
        />
      </div>
    </Fragment>
  );
}
