import React, { Fragment, ReactElement } from "react";
import { Link } from "@reach/router";
import { jt, t } from "ttag";
import { SaveNavigation } from "./EarnView";
import { assertNever } from "efi/base/assertNever";
import { Callout } from "@blueprintjs/core";

interface SaveViewSubtitleProps {
  activeTab: SaveNavigation;
}

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

const poolsLink = (
  <Link key="pools-link" to={`/principal`}>
    {t`Element Pools`}
  </Link>
);
export function SaveViewSubtitle(
  props: SaveViewSubtitleProps
): ReactElement | null {
  const { activeTab } = props;

  switch (activeTab) {
    case SaveNavigation.SAVE:
      return (
        <Fragment>{jt`Principal Tokens are redeemable one-to-one with their base asset once they have reached their maturity date. To boost your APY further, you may stake your tokens on the ${portfolioLink}. ${fixedYieldLink}`}</Fragment>
      );

    case SaveNavigation.BALANCES:
      return (
        <Callout>{jt`Tip: Earn additional yield on your Principal tokens by providing them as liquidity in ${poolsLink}.`}</Callout>
      );

    default:
      assertNever(activeTab);
      return null;
  }
}
