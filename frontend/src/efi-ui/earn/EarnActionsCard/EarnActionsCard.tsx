import { ReactElement } from "react";

import { Card } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { PrincipalTokenInfo as TrancheInfo } from "tokenlists/types";

import tw from "efi-tailwindcss-classnames";
import { EarnActionsTabId } from "efi-ui/earn/EarnActionsTabs/EarnActionsTabId";
import { EarnActionsTabs } from "efi-ui/earn/EarnActionsTabs/EarnActionsTabs";
import { MintCard } from "efi-ui/mint/MintCard/MintCard";
import { SellPrincipalTokensForm } from "efi-ui/portfolio/PrincipalTokenActionsCard/SellPrincipalTokensForm";

interface EarnActionsCardProps {
  library: Web3Provider | undefined;
  account: string | null | undefined;
  trancheInfo: TrancheInfo;
  activeTabId: EarnActionsTabId;
  setActiveTabId: (tabId: EarnActionsTabId) => void;
}

export function EarnActionsCard(props: EarnActionsCardProps): ReactElement {
  const { library, account, activeTabId, setActiveTabId, trancheInfo } = props;

  return (
    <Card className={tw("flex", "space-x-6")}>
      <EarnActionsTabs
        unlockTimestamp={trancheInfo.extensions.unlockTimestamp}
        activeTabId={activeTabId}
        onSetActiveTab={setActiveTabId}
      />

      <div className={tw("flex", "flex-col", "flex-1")}>
        {activeTabId === EarnActionsTabId.MINT ? (
          <MintCard
            library={library}
            account={account}
            trancheInfo={trancheInfo}
          />
        ) : null}
        {activeTabId === EarnActionsTabId.SELL ? (
          <SellPrincipalTokensForm
            account={account}
            library={library}
            principalToken={trancheInfo}
          />
        ) : null}
        {activeTabId === EarnActionsTabId.STAKE ? (
          <span>coming soon</span>
        ) : null}
      </div>
    </Card>
  );
}
