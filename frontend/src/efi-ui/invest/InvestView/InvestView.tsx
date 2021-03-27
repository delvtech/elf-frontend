import React, { FC, Fragment } from "react";

import { Intent, Tag } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { RouteComponentProps } from "@reach/router";
import { useWeb3React } from "@web3-react/core";
import { jt, t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { useTranchesByBaseAsset } from "efi-ui/invest/hooks/useTranchesByBaseAsset";
import { InvestCard } from "efi-ui/invest/InvestView/InvestCard";
import { ViewTitle } from "efi-ui/page/ViewTitle/ViewTitle";
import { useTrancheContracts } from "efi-ui/tranche/useTrancheContracts";
import { useBaseAssetsForTranches } from "efi-ui/tranche/useBaseAssetsForTranches";

interface InvestViewProps extends RouteComponentProps {}

export const InvestView: FC<InvestViewProps> = () => {
  const {
    account,
    active,
    chainId,
    connector,
    library,
  } = useWeb3React<Web3Provider>();

  const allTranches = useTrancheContracts();
  const knownBaseAssets = useBaseAssetsForTranches(allTranches);
  const tranchesByBaseAsset = useTranchesByBaseAsset(
    allTranches,
    knownBaseAssets
  );

  return (
    <div
      data-testid="invest-view"
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
        title={t`Invest`}
        titleTag={<Tag minimal intent={Intent.WARNING}>{t`alpha`}</Tag>}
        subtitle={<InvestViewSubtitle />}
      />

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
          className={tw("flex", "flex-col", "space-y-12")}
          style={{ width: 672 }}
        >
          <InvestCard
            library={library}
            account={account}
            walletConnectionActive={active}
            chainId={chainId}
            connector={connector}
            baseAssets={knownBaseAssets}
            tranchesByBaseAsset={tranchesByBaseAsset}
          />
        </div>
      </div>
    </div>
  );
};

const InvestViewSubtitle: FC = () => {
  const fixedYieldLink = (
    <a key="fixed-yield-link" href={"/invest"}>
      {t`Read more about Fixed Yield.`}
    </a>
  );

  return (
    <Fragment>{jt`Fixed Yield assets are redeemable one-to-one with their base asset once they have reached their maturity date. ${fixedYieldLink}`}</Fragment>
  );
};
