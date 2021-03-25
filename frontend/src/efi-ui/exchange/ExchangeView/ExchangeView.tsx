import React, { FC } from "react";

import { Card } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { RouteComponentProps } from "@reach/router";
import { useWeb3React } from "@web3-react/core";
import { Signer } from "ethers";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { MarketFilterOptions } from "efi-ui/markets/MarketFilterOptions/MarketFilterOptions";
import { ViewTitle } from "efi-ui/page/ViewTitle/ViewTitle";
import { PoolsTable } from "efi-ui/pools/PoolsTable/PoolsTable";

interface ExchangeViewProps extends RouteComponentProps {}

export const ExchangeView: FC<ExchangeViewProps> = () => {
  const { library, account } = useWeb3React<Web3Provider>();

  const signer = account ? (library?.getSigner(account) as Signer) : undefined;

  return (
    <div
      data-testid="exchange-view"
      className={tw("flex", "p-12", "h-full", "space-x-12", "overflow-scroll")}
    >
      {/* Main content */}
      <div className={tw("flex", "flex-col", "flex-1", "space-y-12")}>
        {/* page title */}
        <ViewTitle
          title={t`Element Exchange`}
          subtitle={t`Provide liquidity for this market, or trade for what you want.`}
        />

        <div className={tw("flex", "space-x-12")}>
          {/* Right hand side */}
          <div
            className={tw(
              "hidden",
              "lg:block",
              "h-full",
              "flex-shrink-0",
              "w-64"
            )}
          >
            <MarketFilterOptions />
          </div>
          <div className={tw("flex", "flex-1")}>
            <Card className={tw("p-10", "flex", "flex-1")}>
              <PoolsTable signerOrProvider={signer} className={tw("w-full")} />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
