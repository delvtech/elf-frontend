import React, { FC, Fragment, ReactElement } from "react";
import { Helmet } from "react-helmet";

import { Intent, Tag } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { RouteComponentProps } from "@reach/router";
import { useWeb3React } from "@web3-react/core";
import uniqBy from "lodash.uniqby";
import { jt, t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { useTranchesByBaseAsset } from "efi-ui/earn/hooks/useTranchesByBaseAsset";
import { MintCard } from "efi-ui/mint/MintCard/MintCard";
import { ViewTitle } from "efi-ui/page/ViewTitle/ViewTitle";
import { useBaseAssetsForTranches } from "efi-ui/tranche/useBaseAssetsForTranches";
import { useOpenTranches } from "efi-ui/tranche/useOpenTranches";

interface MintViewProps extends RouteComponentProps {}

export function MintView(props: MintViewProps): ReactElement {
  const {
    account,
    library,
    active,
    chainId,
    connector,
  } = useWeb3React<Web3Provider>();
  const openTranches = useOpenTranches();
  const allBaseAssets = useBaseAssetsForTranches(openTranches);
  const tranchesByBaseAsset = useTranchesByBaseAsset(
    openTranches,
    allBaseAssets
  );
  const uniqueBaseAssets = uniqBy(allBaseAssets, (v) => v?.id);

  return (
    <Fragment>
      <Helmet>
        <title>{t`Mint principal and yield tokens`}</title>
      </Helmet>
      <div
        data-testid="mint-view"
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
              title={t`Stay liquid with Principal and Yield Tokens`}
              titleTag={<Tag minimal intent={Intent.WARNING}>{t`alpha`}</Tag>}
              subtitle={<EarnViewSubtitle />}
            />
            <MintCard
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
    </Fragment>
  );
}

const EarnViewSubtitle: FC = () => {
  const mintingLink = (
    <a key="minting-link" href={"/"}>
      {t`Read more about Minting.`}
    </a>
  );

  return (
    <Fragment>{jt`Mint into a high-interest DeFi yield position and receive Principal and Yield tokens that can be traded at any time. ${mintingLink}`}</Fragment>
  );
};
