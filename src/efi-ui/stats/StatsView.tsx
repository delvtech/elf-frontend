import { Fragment, ReactElement } from "react";
import { Helmet } from "react-helmet";

import { Card } from "@blueprintjs/core";
import { RouteComponentProps } from "@reach/router";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { useTotalValueLockedForPlatform } from "efi-ui/stats/useTotalValueLockedForPlatform";
import { formatMoney } from "efi/money/formatMoney";

interface StatsViewProps extends RouteComponentProps {}

export function StatsView(unusedProps: StatsViewProps): ReactElement {
  const tvl = useTotalValueLockedForPlatform();
  return (
    <Fragment>
      <Helmet>
        <title>{t`Stats | Element.fi`}</title>
      </Helmet>
      {/* Main content */}
      <div
        data-testid="stats-view"
        className={tw(
          "flex",
          "flex-col",
          "h-full",
          "flex-1",
          "items-center",
          "justify-center"
        )}
      >
        <Card>{t`Element TVL: ${formatMoney(tvl)}`}</Card>
      </div>
    </Fragment>
  );
}
