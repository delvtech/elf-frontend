import { ReactElement } from "react";

import { Card } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { PrincipalTokenInfo } from "tokenlists/types";

import tw from "efi-tailwindcss-classnames";
import { BuyPrincipalTokensForm } from "efi-ui/portfolio/PrincipalTokenActionsCard/BuyPrincipalTokensForm";
import { PrincipalTokenActionTabId } from "efi-ui/portfolio/PrincipalTokenActionTabs/tabs";
import { PrincipalTokenActionTabs } from "efi-ui/portfolio/PrincipalTokenActionTabs/PrincipalTokenActionTabs";
import { PrincipalTokenInformation } from "efi-ui/portfolio/PrincipalTokenInformation/PrincipalTokenInformation";
import { SellPrincipalTokensForm } from "efi-ui/portfolio/PrincipalTokenActionsCard/SellPrincipalTokensForm";
import { getIsMature2 } from "efi/tranche/getIsMature";

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
      <PrincipalTokenActionTabs
        activeTabId={activeTabId}
        onSetActiveTab={setActiveTabId}
        isRedeemDisabled={!isMature}
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
          <SellPrincipalTokensForm
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
