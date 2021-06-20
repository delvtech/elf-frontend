import { ReactElement } from "react";

import { Card, Intent } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { PrincipalTokenInfo as TrancheInfo } from "tokenlists/types";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { EarnActionsTabId } from "efi-ui/earn/EarnActionsTabs/EarnActionsTabId";
import { EarnActionsTabs } from "efi-ui/earn/EarnActionsTabs/EarnActionsTabs";
import { EarnStakingForm } from "efi-ui/earn/EarnStakingForm/EarnStakingForm";
import { MintCard } from "efi-ui/mint/MintCard/MintCard";
import { SellPrincipalTokensForm } from "efi-ui/portfolio/PrincipalTokenActionsCard/SellPrincipalTokensForm";
import { Signer } from "ethers";
import { getPrincipalPoolForTranche } from "efi/pools/ccpool";

interface EarnActionsCardProps {
  signer: Signer | undefined;
  library: Web3Provider | undefined;
  account: string | null | undefined;
  trancheInfo: TrancheInfo;
  activeTabId: EarnActionsTabId;
  setActiveTabId: (tabId: EarnActionsTabId) => void;
}

export function EarnActionsCard(props: EarnActionsCardProps): ReactElement {
  const { signer, library, account, activeTabId, setActiveTabId, trancheInfo } =
    props;

  const poolInfo = getPrincipalPoolForTranche(trancheInfo.address);

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
          <EarnStakingForm
            library={library}
            signer={signer}
            account={account}
            poolInfo={poolInfo}
            buttonLabel={t`Add liquidity`}
            formDisabled={false}
            submitDisabled={false}
            buttonIntent={Intent.PRIMARY}
          />
        ) : null}
      </div>
    </Card>
  );
}
