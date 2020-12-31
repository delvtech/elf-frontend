import { Breadcrumbs, IBreadcrumbProps } from "@blueprintjs/core";
import React, { FC, useMemo } from "react";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { Pool } from "efi/pools/Pool";

interface PoolBreadcrumbProps {
  availablePools: Pool[];
  activePool?: string;
  setActivePool: (poolId: string | undefined) => void;
}

export const PoolBreadcrumb: FC<PoolBreadcrumbProps> = ({
  availablePools,
  activePool,
  setActivePool,
}) => {
  const items = useBreadcrumbItems(availablePools, activePool, setActivePool);

  return <Breadcrumbs className={tw("text-lg")} items={items} />;
};

function useBreadcrumbItems(
  availablePools: Pool[],
  activePool: string | undefined,
  setActivePool: (strategyId: string | undefined) => void
): IBreadcrumbProps[] {
  return useMemo(() => {
    const poolsById = Object.fromEntries(
      availablePools.map((pool) => [pool.id, pool])
    );

    const newItems: IBreadcrumbProps[] = [];

    if (activePool) {
      // Only show the root breadcrumb if we're deeper than the root
      newItems.push({
        onClick: () => setActivePool(undefined),
        text: t`Element Pools`,
      });
      newItems.push({ text: poolsById[activePool].name });
    }

    return newItems;
  }, [activePool, availablePools, setActivePool]);
}
