import { ReactElement, useState } from "react";

import { Card, Collapse, Elevation } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { PrincipalTokenInfo } from "tokenlists/types";

import tw from "efi-tailwindcss-classnames";
import { PortfolioActionsCard } from "efi-ui/portfolio/PortfolioActionsCard/PortfolioActionsCard";
import { PortfolioActionTabId } from "efi-ui/portfolio/PortfolioActionsCard/PortfolioActionTabId";
import { PortfolioSummaryCard } from "efi-ui/save/SavePortfolioList/PortfolioSummaryCard";
import { useTokenBalanceOf } from "efi-ui/token/hooks/useTokenBalanceOf";
import { isDust } from "efi/coins/isDust";
import { trancheContractsByAddress } from "efi/tranche/tranches";

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
    principalToken: { address, decimals },
  } = props;

  const [activeTabId, setActiveTabId] = useState<PortfolioActionTabId>(
    PortfolioActionTabId.BUY
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
      <PortfolioSummaryCard
        account={account}
        principalToken={principalToken}
        isExpanded={isExpanded}
        onExpandClose={onExpandClose}
        onExpandOpen={onExpandOpen}
      />

      <Collapse isOpen={isExpanded}>
        <PortfolioActionsCard
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
