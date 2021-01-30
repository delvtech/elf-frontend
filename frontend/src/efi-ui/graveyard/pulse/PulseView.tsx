import { Tab, Tabs } from "@blueprintjs/core";
import { RouteComponentProps } from "@reach/router";
import React, { FC, useState } from "react";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { PortfolioDashboard } from "efi-ui/graveyard/pulse/PortfolioDashboard/PortfolioDashbord";

interface PulseViewProps extends RouteComponentProps {}

enum PulseTab {
  // TODO: Uncomment these when we have dashboards for them
  // ALL_MARKETS = "all-markets",
  // GOVERNANCE = "governance",
  WALLET = "current-wallet",
}
export const PulseView: FC<PulseViewProps> = () => {
  const [activePulseTab, setActivePulseTab] = useState<PulseTab>(
    PulseTab.WALLET
  );

  return (
    <div
      className={tw("flex", "flex-col", "h-full", "w-full", "p-8", "space-y-8")}
    >
      <Tabs
        large
        selectedTabId={activePulseTab}
        onChange={(tabId: PulseTab) => setActivePulseTab(tabId)}
      >
        <Tab id={PulseTab.WALLET} className="foo">
          <span>{t`My portfolio`}</span>
        </Tab>
      </Tabs>

      {activePulseTab === PulseTab.WALLET && <PortfolioDashboard />}
    </div>
  );
};
