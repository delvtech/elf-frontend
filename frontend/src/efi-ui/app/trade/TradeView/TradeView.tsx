import { Fragment, ReactElement, useState } from "react";
import { Helmet } from "react-helmet";

import { RouteComponentProps } from "@reach/router";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { Classes, Divider, H2, H4, Tab, Tabs } from "@blueprintjs/core";
import { assertNever } from "efi/base/assertNever";
import classNames from "classnames";
import { PrincipalPoolCardList } from "efi-ui/pools/PrincipalPoolCardList/PrincipalPoolCardList";
import { YieldPoolCardList } from "efi-ui/pools/YieldPoolCardList/YieldPoolCardList";
import { PrincipalPoolTable } from "efi-ui/pools/PrincipalPoolTable/PrincipalPoolTable";
import { YieldPoolTable } from "efi-ui/pools/YieldPoolTable/YieldPoolTable";

enum TradeViewTab {
  PRINCIPAL = "principal",
  YIELD = "yield",
}
interface TradeViewProps extends RouteComponentProps {}

export function TradeView(unusedProps: TradeViewProps): ReactElement {
  const [activeTab, setActiveTab] = useState<TradeViewTab>(
    TradeViewTab.PRINCIPAL
  );

  const subtitle =
    activeTab === TradeViewTab.YIELD
      ? t`Buy and sell yield tokens or provide liquidity in Element yield pools.`
      : t`Buy and sell principal tokens or provide liquidity in Element principal pools.`;

  return (
    <Fragment>
      <Helmet>
        <title>{t`Pools | Element.fi`}</title>
      </Helmet>
      <div
        data-testid="pools-view"
        className={tw(
          "flex",
          "flex-col",
          "w-full",
          "space-y-12",
          "items-center",
          "lg:pb-12",
          "pb-24"
        )}
      >
        <Tabs
          selectedTabId={activeTab}
          onChange={setActiveTab as (newTabId: TradeViewTab) => void}
        >
          <Tab
            id={TradeViewTab.PRINCIPAL}
            title={
              <Fragment>
                {/* Desktop */}
                <H2
                  className={tw("hidden", "lg:block")}
                >{t`Principal Pools`}</H2>
                {/* Mobile */}
                <H4
                  className={tw("text-lg", "lg:hidden", "mb-2")}
                >{t`Principal Pools`}</H4>
              </Fragment>
            }
          />
          <Divider />
          <Tab
            id={TradeViewTab.YIELD}
            title={
              <Fragment>
                {/* Desktop */}
                <H2 className={tw("hidden", "lg:block")}>{t`Yield Pools`}</H2>
                {/* Mobile */}
                <H4
                  className={tw("text-lg", "lg:hidden", "mb-2")}
                >{t`Yield Pools`}</H4>
              </Fragment>
            }
          />
        </Tabs>
        <span
          className={classNames(
            Classes.RUNNING_TEXT,
            Classes.TEXT_MUTED,
            tw("text-base", "hidden", "lg:inline")
          )}
        >
          {subtitle}
        </span>
        <div className={tw("flex", "flex-col", "items-center", "w-full")}>
          {(() => {
            switch (activeTab) {
              case TradeViewTab.PRINCIPAL:
                return (
                  <Fragment>
                    {/* Desktop */}
                    <PrincipalPoolTable className={tw("hidden", "lg:flex")} />
                    {/* Mobile */}
                    <PrincipalPoolCardList
                      className={tw("flex", "lg:hidden", "p-4")}
                    />
                  </Fragment>
                );
              case TradeViewTab.YIELD:
                return (
                  <Fragment>
                    {/* Desktop */}
                    <YieldPoolTable className={tw("hidden", "lg:flex")} />
                    {/* Mobile */}
                    <YieldPoolCardList
                      className={tw("flex", "lg:hidden", "p-4")}
                    />
                  </Fragment>
                );
              default:
                assertNever(activeTab);
            }
          })()}
        </div>
      </div>
    </Fragment>
  );
}
