import { ReactElement } from "react";

import { Card, Tab, Tabs } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { PrincipalTokenInfo } from "tokenlists/types";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { SaveTransactionTabId } from "efi-ui/earn/SaveBalancesList/SaveTransactionTabId";

import { BuyPrincipalTokensForm } from "./BuyPrincipalTokensForm";
import { SellPrincipalTokensForm } from "efi-ui/earn/SaveBalancesList/SellPrincipalTokensForm";
import { getIsMature2 } from "efi/tranche/getIsMature";

interface SaveTransactionsCardProps {
  library: Web3Provider | undefined;
  account: string | null | undefined;
  principalToken: PrincipalTokenInfo;
  activeTabId: SaveTransactionTabId;
  setActiveTabId: (tabId: SaveTransactionTabId) => void;
}

export function SaveTransactionsCard(
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
        <Tab id={SaveTransactionTabId.BUY}>{t`Buy`}</Tab>
        <Tab id={SaveTransactionTabId.SELL}>{t`Sell`}</Tab>
        <Tab
          disabled={!isMature}
          id={SaveTransactionTabId.REDEEM}
        >{t`Redeem`}</Tab>
        <Tab disabled id={SaveTransactionTabId.INFO}>{t`More Information`}</Tab>
      </Tabs>
      <div className={tw("flex", "flex-col", "flex-1")}>
        {activeTabId === SaveTransactionTabId.BUY ? (
          <BuyPrincipalTokensForm
            account={account}
            library={library}
            principalToken={principalToken}
          />
        ) : null}
        {activeTabId === SaveTransactionTabId.SELL ? (
          <SellPrincipalTokensForm
            account={account}
            library={library}
            principalToken={principalToken}
          />
        ) : null}
      </div>
    </Card>
  );
}
