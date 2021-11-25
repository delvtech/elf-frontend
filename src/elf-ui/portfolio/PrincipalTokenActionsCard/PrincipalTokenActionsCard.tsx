import { ReactElement } from "react";

import { Card } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { PrincipalTokenInfo } from "tokenlists/types";

import tw from "elf-tailwindcss-classnames";
import { BuyPrincipalTokensForm } from "elf-ui/portfolio/PrincipalTokenActionsCard/BuyPrincipalTokensForm";
import { PrincipalTokenActionTabId } from "elf-ui/portfolio/PrincipalTokenActionTabs/tabs";
import { PrincipalTokenActionTabs } from "elf-ui/portfolio/PrincipalTokenActionTabs/PrincipalTokenActionTabs";
import { PrincipalTokenInformation } from "elf-ui/portfolio/PrincipalTokenInformation/PrincipalTokenInformation";
import { SellPrincipalTokensForm } from "elf-ui/portfolio/PrincipalTokenActionsCard/SellPrincipalTokensForm";
import { RedeemPrincipalTokensForm } from "elf-ui/portfolio/PrincipalTokenActionsCard/RedeemPrincipalTokensForm";

interface PrincipalTokenActionsCardProps {
  library: Web3Provider | undefined;
  account: string | null | undefined;
  principalToken: PrincipalTokenInfo;
  activeTabId: PrincipalTokenActionTabId;
  setActiveTabId: (tabId: PrincipalTokenActionTabId) => void;
}

export function PrincipalTokenActionsCard(
  props: PrincipalTokenActionsCardProps
): ReactElement {
  const { library, account, activeTabId, setActiveTabId, principalToken } =
    props;

  return (
    <Card className={tw("flex", "space-x-6", "flex-col", "lg:flex-row")}>
      <PrincipalTokenActionTabs
        principalToken={principalToken}
        activeTabId={activeTabId}
        onSetActiveTab={setActiveTabId}
      />

      <div className={tw("flex", "flex-col", "flex-1")}>
        {activeTabId === PrincipalTokenActionTabId.BUY ? (
          <BuyPrincipalTokensForm
            account={account}
            library={library}
            principalToken={principalToken}
          />
        ) : null}
        {activeTabId === PrincipalTokenActionTabId.SELL ? (
          <SellPrincipalTokensForm
            account={account}
            library={library}
            principalToken={principalToken}
          />
        ) : null}
        {activeTabId === PrincipalTokenActionTabId.REDEEM ? (
          <RedeemPrincipalTokensForm
            account={account}
            library={library}
            principalToken={principalToken}
          />
        ) : null}
        {activeTabId === PrincipalTokenActionTabId.INFO ? (
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
