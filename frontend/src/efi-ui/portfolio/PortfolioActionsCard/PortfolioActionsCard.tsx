import { ReactElement } from "react";

import { Card, Tab, Tabs } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { PrincipalTokenInfo } from "tokenlists/types";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { BuyPrincipalTokensForm } from "efi-ui/portfolio/PortfolioActionsCard/BuyPrincipalTokensForm";
import { PortfolioActionTabId } from "efi-ui/portfolio/PortfolioActionsCard/PortfolioActionTabId";
import { PrincipalTokenInformation } from "efi-ui/portfolio/PortfolioActionsCard/PrincipalTokenInformation";
import { SellPrincipalTokensForm } from "efi-ui/portfolio/PortfolioActionsCard/SellPrincipalTokensForm";
import { getIsMature2 } from "efi/tranche/getIsMature";

interface SaveTransactionsCardProps {
  library: Web3Provider | undefined;
  account: string | null | undefined;
  principalToken: PrincipalTokenInfo;
  activeTabId: PortfolioActionTabId;
  setActiveTabId: (tabId: PortfolioActionTabId) => void;
}

export function PortfolioActionsCard(
  props: SaveTransactionsCardProps
): ReactElement {
  const {
    library,
    account,
    activeTabId,
    setActiveTabId,
    principalToken,
    principalToken: {
      extensions: { unlockTimestamp },
    },
  } = props;

  // base asset
  const isMature = getIsMature2(unlockTimestamp);

  return (
    <Card className={tw("flex", "space-x-6")}>
      <Tabs
        id="save-transactions-tab"
        vertical
        selectedTabId={activeTabId}
        className={tw("text-left")}
        onChange={setActiveTabId}
      >
        <Tab id={PortfolioActionTabId.BUY}>{t`Buy`}</Tab>
        <Tab id={PortfolioActionTabId.SELL}>{t`Sell`}</Tab>
        <Tab
          disabled={!isMature}
          id={PortfolioActionTabId.REDEEM}
        >{t`Redeem`}</Tab>
        <Tab id={PortfolioActionTabId.INFO}>{t`More Information`}</Tab>
      </Tabs>
      <div className={tw("flex", "flex-col", "flex-1")}>
        {activeTabId === PortfolioActionTabId.BUY ? (
          <BuyPrincipalTokensForm
            account={account}
            library={library}
            principalToken={principalToken}
          />
        ) : null}
        {activeTabId === PortfolioActionTabId.SELL ? (
          <SellPrincipalTokensForm
            account={account}
            library={library}
            principalToken={principalToken}
          />
        ) : null}
        {activeTabId === PortfolioActionTabId.REDEEM ? (
          <SellPrincipalTokensForm
            account={account}
            library={library}
            principalToken={principalToken}
          />
        ) : null}
        {activeTabId === PortfolioActionTabId.INFO ? (
          <PrincipalTokenInformation
            account={account}
            library={library}
            principalToken={principalToken}
          />
        ) : null}
      </div>
    </Card>
  );
}
