import React, { FC, Fragment } from "react";

import { Intent, Tag } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { RouteComponentProps } from "@reach/router";
import { useWeb3React } from "@web3-react/core";
import { jt, t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { useTranchesByBaseAsset } from "efi-ui/earn/hooks/useTranchesByBaseAsset";
import { MintCard } from "efi-ui/mint/MintCard/MintCard";
import { ViewTitle } from "efi-ui/page/ViewTitle/ViewTitle";
import { useBaseAssetsForTranches } from "efi-ui/tranche/useBaseAssetsForTranches";
import { useOpenTranches } from "efi-ui/tranche/useOpenTranches";

interface MintViewProps extends RouteComponentProps {}

export const MintView: FC<MintViewProps> = () => {
  const {
    account,
    library,
    active,
    chainId,
    connector,
  } = useWeb3React<Web3Provider>();
  const openTranches = useOpenTranches();
  const knownBaseAssets = useBaseAssetsForTranches(openTranches);
  const tranchesByBaseAsset = useTranchesByBaseAsset(
    openTranches,
    knownBaseAssets
  );

  return (
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
            baseAssets={knownBaseAssets}
            tranchesByBaseAsset={tranchesByBaseAsset}
          />
        </div>
      </div>
    </div>
  );
};

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
