import React, { FC, Fragment, ReactElement } from "react";
import { Helmet } from "react-helmet";

import { Intent, Tag } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { Link, RouteComponentProps } from "@reach/router";
import { useWeb3React } from "@web3-react/core";
import uniqBy from "lodash.uniqby";
import { jt, t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { EarnCard } from "efi-ui/earn/EarnCard/EarnCard";
import { useTranchesByBaseAsset } from "efi-ui/earn/hooks/useTranchesByBaseAsset";
import { ViewTitle } from "efi-ui/page/ViewTitle/ViewTitle";
import { useBaseAssetsForTranches } from "efi-ui/tranche/useBaseAssetsForTranches";
import { useOpenTranches } from "efi-ui/tranche/useOpenTranches";

interface EarnViewProps extends RouteComponentProps {}
export function EarnView(props: EarnViewProps): ReactElement {
  const { account, library } = useWeb3React<Web3Provider>();

  const openTranches = useOpenTranches();

  const allBaseAssets = useBaseAssetsForTranches(openTranches);
  const tranchesByBaseAsset = useTranchesByBaseAsset(
    openTranches,
    allBaseAssets
  );

  const uniqueBaseAssets = uniqBy(
    allBaseAssets.filter((v) => !!v),
    (v) => v?.id
  );

  return (
    <Fragment>
      <Helmet>
        <title>{t`Earn fixed yield from buying at a discount. Exit anytime.`}</title>
      </Helmet>
      <div
        data-testid="earn-view"
        className={tw(
          "flex",
          "flex-col",
          "p-12",
          "h-full",
          "items-center",
          "overflow-scroll",
          "text-center"
        )}
      >
        {/* page title */}
        <div style={{ maxWidth: 672 }}>
          <ViewTitle
            title={t`Earn fixed yield from buying at a discount.`}
            bottomTitle={t`Exit anytime.`}
            titleTag={<Tag minimal intent={Intent.WARNING}>{t`alpha`}</Tag>}
            subtitle={<EarnViewSubtitle />}
          />
        </div>
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
            <EarnCard
              library={library}
              account={account}
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
  const fixedYieldLink = (
    <a
      key="fixed-yield-link"
      href={
        "https://medium.com/element-finance/fixed-rate-interest-markets-a-casual-users-journey-through-fixed-rate-interest-using-element-50f420df1859"
      }
      target="_noreferrer"
    >
      {t`Read more about Fixed Yield.`}
    </a>
  );

  const portfolioLink = (
    <Link key="portfolio-link" to={`/portfolio`}>
      {t`Portfolio Page`}
    </Link>
  );

  return (
    <Fragment>{jt`Principal Tokens are redeemable one-to-one with their base asset once they have reached their maturity date. To boost your APY further, you may stake your tokens on the ${portfolioLink}. ${fixedYieldLink}`}</Fragment>
  );
};
