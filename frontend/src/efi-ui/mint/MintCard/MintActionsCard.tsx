import { ReactElement } from "react";

import { Card } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { PrincipalTokenInfo as TrancheInfo } from "tokenlists/types";

import tw from "efi-tailwindcss-classnames";
import { MintActionsTabs } from "efi-ui/mint/MintCard/MintActionsTabs";
import { SellPrincipalTokensForm } from "efi-ui/portfolio/PrincipalTokenActionsCard/SellPrincipalTokensForm";
import { MintCard } from "efi-ui/mint/MintCard/MintCard";

export enum MintActionsTabId {
  MINT = "mint",
  SELL = "sell",
  STAKE = "stake",
}

interface MintActionsCardProps {
  library: Web3Provider | undefined;
  account: string | null | undefined;
  trancheInfo: TrancheInfo;
  activeTabId: MintActionsTabId;
  setActiveTabId: (tabId: MintActionsTabId) => void;
}

export function MintActionsCard(props: MintActionsCardProps): ReactElement {
  const { library, account, activeTabId, setActiveTabId, trancheInfo } = props;

  return (
    <Card className={tw("flex", "space-x-6")}>
      <MintActionsTabs
        unlockTimestamp={trancheInfo.extensions.unlockTimestamp}
        activeTabId={activeTabId}
        onSetActiveTab={setActiveTabId}
      />

      <div className={tw("flex", "flex-col", "flex-1")}>
        {activeTabId === MintActionsTabId.MINT ? (
          <MintCard
            library={library}
            account={account}
            trancheInfo={trancheInfo}
          />
        ) : null}
        {activeTabId === MintActionsTabId.SELL ? (
          <SellPrincipalTokensForm
            account={account}
            library={library}
            principalToken={trancheInfo}
          />
        ) : null}
        {activeTabId === MintActionsTabId.STAKE ? (
          <span>coming soon</span>
        ) : null}
      </div>
    </Card>
  );
}
