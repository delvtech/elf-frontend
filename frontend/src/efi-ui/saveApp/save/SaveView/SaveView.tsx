import { Fragment, ReactElement } from "react";
import { Helmet } from "react-helmet";

import { H5, NonIdealState } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Web3Provider } from "@ethersproject/providers";
import { RouteComponentProps } from "@reach/router";
import { useWeb3React } from "@web3-react/core";
import { jt, t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { ViewTitle } from "efi-ui/page/ViewTitle/ViewTitle";
import { SaveAppHeader } from "efi-ui/saveApp/page/SaveAppHeader/SaveAppHeader";
import { SaveCard } from "efi-ui/saveApp/save/SaveCard/SaveCard";
import { useOpenTrancheContracts } from "efi-ui/tranche/useOpenTrancheContracts";
import { ViewBalancesButton } from "./ViewBalancesButton";

interface EarnViewProps extends RouteComponentProps {}

const fixedYieldLink = (
  <a
    key="fixed-yield-link"
    href={
      "https://medium.com/element-finance/fixed-rate-interest-markets-a-casual-users-journey-through-fixed-rate-interest-using-element-50f420df1859"
    }
    target="_noreferrer"
  >
    {t`Read more about Fixed Yield`}
  </a>
);

export function SaveView(unusedProps: EarnViewProps): ReactElement {
  const {
    account,
    library,
    chainId,
    active: walletConnectionActive,
  } = useWeb3React<Web3Provider>();
  const openTrancheContracts = useOpenTrancheContracts();

  return (
    <Fragment>
      <Helmet>
        <title>{t`Earn fixed yield from buying at a discount. Exit anytime.`}</title>
      </Helmet>
      <div
        data-testid="save-view"
        className={tw(
          "flex",
          "flex-col",
          "h-full",
          "items-center",
          "overflow-scroll"
        )}
      >
        <SaveAppHeader
          account={account}
          walletConnectionActive={walletConnectionActive}
          chainId={chainId}
        />

        <div
          className={tw(
            "flex",
            "flex-col",
            "w-full",
            "items-center",
            "text-center",
            "space-y-10",
            "pt-2",
            "px-6",
            "pb-24",
            "lg:pt-10",
            "lg:max-w-2xl"
          )}
        >
          <H5 className={tw("lg:hidden")}>{fixedYieldLink}</H5>
          <ViewTitle
            className={tw("hidden", "lg:flex")}
            title={t`The simplest way to grow your crypto.`}
            subtitle={jt`No minimums, no withdrawal penalties, exit anytime. ${fixedYieldLink}.`}
          />
          <div
            className={tw(
              "flex",
              "w-full",
              "flex-col",
              "space-y-4",
              "lg:max-w-2xl"
            )}
          >
            <ViewBalancesButton className={tw("hidden", "lg:block")} />

            {openTrancheContracts.length ? (
              <SaveCard library={library} account={account} />
            ) : (
              <NonIdealState
                icon={IconNames.BANK_ACCOUNT}
                title={t`No terms available at this time`}
                description={t`Please check back soon!`}
              />
            )}
          </div>
        </div>
      </div>
    </Fragment>
  );
}
