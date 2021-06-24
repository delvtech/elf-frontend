import { ReactElement, useState } from "react";

import { Card, Collapse, Elevation } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { PrincipalTokenInfo } from "tokenlists/types";

import tw from "efi-tailwindcss-classnames";
import { PrincipalTokenActionsCard } from "efi-ui/portfolio/PrincipalTokenActionsCard/PrincipalTokenActionsCard";
import { PrincipalTokenActionTabId } from "efi-ui/portfolio/PrincipalTokenActionTabs/tabs";
import { PrincipalTokenSummaryCard } from "efi-ui/portfolio/PrincipalTokenSummaryCard/PrincipalTokenSummaryCard";
import { useTokenBalanceOf } from "efi-ui/token/hooks/useTokenBalanceOf";
import { isDust } from "efi/coins/isDust";
import { trancheContractsByAddress } from "efi/tranche/tranches";
import { getIsMature } from "efi/tranche/getIsMature";

interface SavePortfolioCardProps {
  library: Web3Provider | undefined;
  account: string | null | undefined;
  principalToken: PrincipalTokenInfo;
  isExpanded: boolean;
  onExpandOpen: () => void;
  onExpandClose: () => void;
}

export function SavePortfolioCard(
  props: SavePortfolioCardProps
): ReactElement | null {
  const {
    library,
    account,
    isExpanded,
    onExpandOpen,
    onExpandClose,
    principalToken,
    principalToken: {
      address,
      decimals,
      extensions: { unlockTimestamp },
    },
  } = props;

  const isMature = getIsMature(unlockTimestamp);
  const [activeTabId, setActiveTabId] = useState<PrincipalTokenActionTabId>(
    isMature ? PrincipalTokenActionTabId.REDEEM : PrincipalTokenActionTabId.BUY
  );

  const tranche = trancheContractsByAddress[address];
  const { data: balanceOf, isLoading } = useTokenBalanceOf(tranche, account);
  if (
    isLoading ||
    (balanceOf && isDust(balanceOf, decimals)) ||
    balanceOf?.isZero()
  ) {
    return null;
  }

  return (
    <Card
      interactive={!isExpanded}
      elevation={isExpanded ? Elevation.THREE : Elevation.ZERO}
      className={tw("p-0")}
    >
      <PrincipalTokenSummaryCard
        account={account}
        principalToken={principalToken}
        isExpanded={isExpanded}
        onExpandClose={onExpandClose}
        onExpandOpen={onExpandOpen}
      />

      <Collapse isOpen={isExpanded}>
        <PrincipalTokenActionsCard
          library={library}
          account={account}
          principalToken={principalToken}
          activeTabId={activeTabId}
          setActiveTabId={setActiveTabId}
        />
      </Collapse>
    </Card>
  );
}
