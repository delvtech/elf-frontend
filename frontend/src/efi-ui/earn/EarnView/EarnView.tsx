import React, { FC, Fragment } from "react";

import { Web3Provider } from "@ethersproject/providers";
import { RouteComponentProps } from "@reach/router";
import { useWeb3React } from "@web3-react/core";
import { jt, t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { EarnCard } from "efi-ui/earn/EarnCard/EarnCard";
import { useTranchesByBaseAsset } from "efi-ui/earn/hooks/useTranchesByBaseAsset";
import { ViewTitle } from "efi-ui/page/ViewTitle/ViewTitle";
import { useBaseAssetsForTranches } from "efi-ui/tranche/useBaseAssetsForTranches";
import { uniqBy } from "lodash";
import { useOpenTranches } from "../../tranche/useOpenTranches";

interface EarnViewProps extends RouteComponentProps {}

export const EarnView: FC<EarnViewProps> = () => {
  const {
    account,
    active,
    chainId,
    connector,
    library,
  } = useWeb3React<Web3Provider>();

  const openTranches = useOpenTranches();

  const allBaseAssets = useBaseAssetsForTranches(openTranches);
  const tranchesByBaseAsset = useTranchesByBaseAsset(
    openTranches,
    allBaseAssets
  );

  const uniqueBaseAssets = uniqBy(allBaseAssets, (v) => v?.id);

  return (
    <div
      data-testid="earn-view"
      className={tw(
        "flex",
        "flex-col",
        "p-12",
        "h-full",
        "space-y-12",
        "overflow-scroll"
      )}
    >
      {/* Main content */}
      <div
        className={tw(
          "flex",
          "flex-col",
          "flex-1",
          "space-y-12",
          "pt-12",
          "items-center",
          "justify-center"
        )}
      >
        <div
          className={tw("flex", "flex-col", "space-y-12", "text-center")}
          style={{ width: 672 }}
        >
          {/* page title */}
          <ViewTitle
            title={t`Earn fixed yield by buying at a discount.`}
            subtitle={<EarnViewSubtitle />}
          />
          <EarnCard
            library={library}
            account={account}
            walletConnectionActive={active}
            chainId={chainId}
            connector={connector}
            baseAssets={uniqueBaseAssets}
            tranchesByBaseAsset={tranchesByBaseAsset}
          />
        </div>
      </div>
    </div>
  );
};

const EarnViewSubtitle: FC = () => {
  const fixedYieldLink = (
    <a key="fixed-yield-link" href={"/invest"}>
      {t`Read more about Fixed Yield.`}
    </a>
  );

  return (
    <Fragment>{jt`Principal tokens are redeemable one-to-one with their base asset once they have reached their maturity date. ${fixedYieldLink}`}</Fragment>
  );
};
