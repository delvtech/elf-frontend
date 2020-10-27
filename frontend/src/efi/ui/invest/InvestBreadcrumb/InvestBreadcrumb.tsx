import { Breadcrumbs, IBreadcrumbProps } from "@blueprintjs/core";
import { CryptoSymbol } from "efi/crypto/CryptoSymbol";
import { Strategy } from "efi/pools/strategy";
import React, { FC, useMemo } from "react";
import { t } from "ttag";

interface InvestBreadcrumbProps {
  availableStrategies: Strategy<CryptoSymbol.ETH>[];
  activeStrategy?: string;
  setActiveStrategy: (strategyId: string | undefined) => void;
}

export const InvestBreadcrumb: FC<InvestBreadcrumbProps> = ({
  availableStrategies,
  activeStrategy,
  setActiveStrategy,
}) => {
  const items = useBreadcrumbItems(
    availableStrategies,
    activeStrategy,
    setActiveStrategy
  );

  return <Breadcrumbs items={items} />;
};

function useBreadcrumbItems(
  availableStrategies: Strategy<CryptoSymbol.ETH>[],
  activeStrategy: string | undefined,
  setActiveStrategy: (strategyId: string | undefined) => void
): IBreadcrumbProps[] {
  return useMemo(() => {
    const strategiesById = Object.fromEntries(
      availableStrategies.map((strategy) => [strategy.id, strategy])
    );

    const newItems: IBreadcrumbProps[] = [];

    if (activeStrategy) {
      // Only show the root breadcrumb if we're deeper than the root
      newItems.push({
        onClick: () => setActiveStrategy(undefined),
        text: t`Invest`,
      });
      newItems.push({ text: strategiesById[activeStrategy].name });
    }

    return newItems;
  }, [activeStrategy, availableStrategies, setActiveStrategy]);
}
