import { Fragment, ReactElement, useCallback } from "react";
import { Helmet } from "react-helmet";

import { Button, H5, NonIdealState } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Web3Provider } from "@ethersproject/providers";
import { navigate, RouteComponentProps } from "@reach/router";
import { useWeb3React } from "@web3-react/core";
import { jt, t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { ViewTitle } from "efi-ui/page/ViewTitle/ViewTitle";
import { SaveAppHeader } from "efi-ui/saveApp/page/SaveAppHeader/SaveAppHeader";
import { SaveCard } from "efi-ui/saveApp/save/SaveCard/SaveCard";
import { useOpenTrancheContracts } from "efi-ui/tranche/useOpenTrancheContracts";

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

  const goToPortfolio = useCallback(() => navigate("/portfolio"), []);
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
            "flex-1",
            "space-y-10",
            "px-6",
            "lg:pt-10",
            "items-center",
            "text-center",
            "max-w-2xl"
          )}
        >
          <H5 className={tw("lg:hidden")}>{fixedYieldLink}</H5>
          <ViewTitle
            className={tw("hidden", "lg:flex")}
            title={t`The simplest way to grow your crypto.`}
            subtitle={jt`No minimums, no withdrawal penalties, exit anytime. ${fixedYieldLink}.`}
          />
          <div className={tw("flex", "flex-col", "space-y-4", "max-w-2xl")}>
            <div className={tw("text-right")}>
              <Button
                minimal
                large
                onClick={goToPortfolio}
                icon={IconNames.TH_LIST}
              >
                {t`View balances`}
              </Button>
            </div>

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
