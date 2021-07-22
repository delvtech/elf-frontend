import { Fragment, ReactElement, useState } from "react";
import { Helmet } from "react-helmet";

import { RouteComponentProps } from "@reach/router";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { Classes, Divider, H2, H4, H5, Tab, Tabs } from "@blueprintjs/core";
import { assertNever } from "efi/base/assertNever";
import { PrincipalPoolTable } from "efi-ui/pools/PoolsTable/PrincipalPoolTable";
import { YieldPoolTable } from "efi-ui/pools/PoolsTable/YieldPoolTable";
import classNames from "classnames";

enum PoolsViewTab {
  PRINCIPAL = "principal",
  YIELD = "yield",
}
interface PoolsViewProps extends RouteComponentProps {}

export function PoolsView(unusedProps: PoolsViewProps): ReactElement {
  const [activeTab, setActiveTab] = useState<PoolsViewTab>(
    PoolsViewTab.PRINCIPAL
  );

  const subtitle =
    activeTab === PoolsViewTab.YIELD
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
          "flex-1",
          "w-full",
          "h-full",
          "space-y-12",
          "pb-12",
          "items-center"
        )}
      >
        <div
          className={tw(
            "flex",
            "flex-col",
            "space-y-4",
            "items-center",
            "pt-4"
          )}
        >
          <Tabs
            selectedTabId={activeTab}
            onChange={setActiveTab as (newTabId: PoolsViewTab) => void}
          >
            <Tab
              id={PoolsViewTab.PRINCIPAL}
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
              id={PoolsViewTab.YIELD}
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
        </div>

        <div
          className={tw(
            "flex",
            "flex-col",
            "items-center",
            "w-full",
            "space-y-5"
          )}
        >
          {(() => {
            switch (activeTab) {
              case PoolsViewTab.PRINCIPAL:
                return <PrincipalPoolTable />;
              case PoolsViewTab.YIELD:
                return <YieldPoolTable />;
              default:
                assertNever(activeTab);
            }
          })()}
        </div>
      </div>
    </Fragment>
  );
}
