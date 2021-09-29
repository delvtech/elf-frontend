import { Fragment, ReactElement, useMemo } from "react";
import { Helmet } from "react-helmet";

import { RouteComponentProps } from "@reach/router";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { FixedRateCardList } from "efi-ui/fixedrates/FixedRateCardList/FixedRateCardList";
import { ViewTitle } from "efi-ui/page/ViewTitle/ViewTitle";
import { useOpenPrincipalTokenInfos } from "efi-ui/tranche/useOpenPrincipalTokenInfos";

interface FixedRatesListViewProps extends RouteComponentProps {}

export function FixedRatesListView(
  unusedProps: FixedRatesListViewProps
): ReactElement {
  const openPrincipalTokenInfos = useOpenPrincipalTokenInfos();

  // TODO: Implement custom sorting UI?
  const sortedPrincipalTokenInfos = useMemo(() => {
    return [...openPrincipalTokenInfos]
      .sort((info) => info.extensions.createdAtTimestamp)
      .reverse();
  }, [openPrincipalTokenInfos]);

  return (
    <Fragment>
      <Helmet>
        <title>{t`Earn fixed yield from buying at a discount. Exit anytime.`}</title>
      </Helmet>
      {/* Top-level route components should specify their own containers. */}
      <div className={tw("flex", "flex-col", "h-full", "items-center")}>
        <div
          className={tw(
            "flex",
            "flex-col",
            "w-full",
            "items-center",
            "text-center",
            "space-y-4",
            "lg:space-y-10",
            "pt-2",
            "px-6",
            "lg:pb-0",
            "lg:pt-10",
            "lg:max-w-4xl"
          )}
        >
          <ViewTitle
            title={t`The simplest way to grow your crypto savings.`}
            subtitle={t`No minimums, no withdrawal penalties, exit anytime.`}
          />
          <div
            className={tw(
              "flex",
              "w-full",
              "flex-col",
              "space-y-4",
              // there is a footer on small screens, so we need to add padding
              // in order for the list to scroll all the way to the bottom.
              "pb-20",
              // On large screens, we just need enough padding so the last card
              // isn't up against the bottom edge of the browser
              "lg:pb-4"
            )}
          >
            <FixedRateCardList principalTokens={sortedPrincipalTokenInfos} />
          </div>
        </div>
      </div>
    </Fragment>
  );
}
