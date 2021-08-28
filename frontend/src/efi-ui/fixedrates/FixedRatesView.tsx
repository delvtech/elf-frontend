import { Fragment, ReactElement, useMemo } from "react";
import { Helmet } from "react-helmet";

import { RouteComponentProps } from "@reach/router";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { FixedRateCardList } from "efi-ui/fixedrates/FixedRateCardList/FixedRateCardList";
import { ViewTitle } from "efi-ui/page/ViewTitle/ViewTitle";
import { useOpenPrincipalTokenInfos } from "efi-ui/tranche/useOpenPrincipaltokenInfos";

interface FixedRatesViewProps extends RouteComponentProps {}

export function FixedRatesView(unusedProps: FixedRatesViewProps): ReactElement {
  const openPrincipalTokenInfos = useOpenPrincipalTokenInfos();

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
      <div
        className={tw(
          "flex",
          "flex-col",
          "h-full",
          "items-center",
          "overflow-scroll"
        )}
      >
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
            "pb-24",
            "lg:pt-10",
            "lg:max-w-4xl"
          )}
        >
          <ViewTitle
            title={t`The simplest way to double your crypto savings.`}
            subtitle={t`No minimums, no withdrawal penalties, exit anytime.`}
          />
          <div className={tw("flex", "w-full", "flex-col", "space-y-4")}>
            <FixedRateCardList principalTokens={sortedPrincipalTokenInfos} />
          </div>
        </div>
      </div>
    </Fragment>
  );
}
