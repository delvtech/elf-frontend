import {
  CSSProperties,
  FC,
  Fragment,
  ReactElement,
  useCallback,
  useState,
} from "react";
import { Helmet } from "react-helmet";

import { Button, Intent, Tag } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { Link, RouteComponentProps } from "@reach/router";
import { useWeb3React } from "@web3-react/core";
import { jt, t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { EarnCard } from "efi-ui/earn/EarnCard/EarnCard";
import { ViewTitle } from "efi-ui/page/ViewTitle/ViewTitle";
import { EarnBalancesList } from "efi-ui/earn/EarnBalancesList/EarnBalancesList";
import { assertNever } from "efi/base/assertNever";
import { principalTokenInfos } from "efi/tranche/tranches";
import { IconNames } from "@blueprintjs/icons";

interface EarnViewProps extends RouteComponentProps {}

const maxWidthStyle: CSSProperties = { maxWidth: 672 };
const widthStyle = { width: 672 };

export enum SaveNavigation {
  SAVE = "save",
  BALANCES = "balances",
}
export function EarnView(props: EarnViewProps): ReactElement {
  const { account, library } = useWeb3React<Web3Provider>();
  const [activeTab, setActiveTab] = useState<SaveNavigation>(
    SaveNavigation.SAVE
  );
  const onActiveTabClick = useCallback(() => {
    switch (activeTab) {
      case SaveNavigation.SAVE:
        setActiveTab(SaveNavigation.BALANCES);
        return;
      case SaveNavigation.BALANCES:
        setActiveTab(SaveNavigation.SAVE);
        return;
      default:
        assertNever(activeTab);
    }
  }, [activeTab]);

  const activeTabLabel = getActiveTabLabel(activeTab, account);
  const activeTabIcon = getActiveTabIconName(activeTab);

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
        <div style={maxWidthStyle}>
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
            className={tw("flex", "flex-col", "space-y-4")}
            style={widthStyle}
          >
            <div className={tw("text-right")}>
              <Button
                minimal
                large
                onClick={onActiveTabClick}
                icon={activeTabIcon}
              >
                {activeTabLabel}
              </Button>
            </div>

            {activeTab === SaveNavigation.SAVE && (
              <EarnCard library={library} account={account} />
            )}

            {activeTab === SaveNavigation.BALANCES && (
              <EarnBalancesList
                account={account}
                principalTokens={principalTokenInfos}
              />
            )}
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
function getActiveTabLabel(
  activeTab: SaveNavigation,
  account: string | null | undefined
) {
  switch (activeTab) {
    case SaveNavigation.SAVE: {
      return t`View balances`;
    }
    case SaveNavigation.BALANCES:
      return t`Back to Save`;
    default:
      assertNever(activeTab);
  }
}

function getActiveTabIconName(activeTab: SaveNavigation) {
  switch (activeTab) {
    case SaveNavigation.SAVE:
      return IconNames.TH_LIST;
    case SaveNavigation.BALANCES:
      return IconNames.ARROW_LEFT;
    default:
      assertNever(activeTab);
  }
}
