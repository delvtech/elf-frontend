import React, { ReactElement } from "react";

import { Tab, Tabs, Tag } from "@blueprintjs/core";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import styles from "./PortfolioTabs.module.css";
import classNames from "classnames";
import { usePrincipalTokensWithoutDust } from "efi-ui/tranche/usePrincipalTokensWithoutDust";
import { useWeightedPoolsWithLPBalance } from "efi-ui/portfolio/hooks/useWeightedPoolsWithLPBalance";
import { useConvergentCurvePoolsWithLPBalance } from "efi-ui/portfolio/hooks/useConvergentCurvePoolsWithLPBalance";
import { interestTokenContracts } from "efi/interestToken/interestToken";
import { useTokensWithBalance } from "efi-ui/token/hooks/useTokensWithBalance";

export enum PortfolioTabId {
  PRINCIPAL_TOKENS = "principalTokens",
  YIELD_TOKENS = "yieldTokens",
  LP_POSITIONS = "lpPositions",
}

interface PortfolioTabsProps {
  account: string | null | undefined;
  onChangeTab: (tabId: PortfolioTabId) => void;
  activePortfolioTabId: string;
}
export function PortfolioTabs({
  account,
  onChangeTab,
  activePortfolioTabId,
}: PortfolioTabsProps): ReactElement {
  const principalTokenInfosWithoutDust = usePrincipalTokensWithoutDust(account);

  // TODO: This is how we do it for the YieldTokenPortfolio, so asking on behalf
  // of both there and here..., should we use a dust calc?
  const yieldTokensWithBalanceResults = useTokensWithBalance(
    account,
    interestTokenContracts
  );

  const interestTokenLPs = useWeightedPoolsWithLPBalance(account);
  const principalTokenLPs = useConvergentCurvePoolsWithLPBalance(account);
  const numLPs = principalTokenLPs.length + interestTokenLPs.length;
  return (
    <Tabs
      id="portfolio-tabs"
      large
      className={classNames(styles.portfolioTabs)}
      onChange={onChangeTab}
      selectedTabId={activePortfolioTabId}
    >
      <Tab id={PortfolioTabId.PRINCIPAL_TOKENS}>
        <div className={tw("flex", "items-center", "text-lg", "space-x-4")}>
          <span>{t`Principal Tokens`} </span>
          {principalTokenInfosWithoutDust.length ? (
            <Tag
              round
              className={classNames(styles.skinnyTag, tw("font-bold"))}
            >
              {principalTokenInfosWithoutDust.length}
            </Tag>
          ) : null}
        </div>
      </Tab>
      <Tab id={PortfolioTabId.YIELD_TOKENS}>
        <div className={tw("flex", "items-center", "text-lg", "space-x-4")}>
          <span>{t`Yield Tokens`} </span>
          {yieldTokensWithBalanceResults.length ? (
            <Tag
              round
              className={classNames(styles.skinnyTag, tw("font-bold"))}
            >
              {yieldTokensWithBalanceResults.length}
            </Tag>
          ) : null}
        </div>
      </Tab>
      <Tab id={PortfolioTabId.LP_POSITIONS}>
        <div className={tw("flex", "items-center", "text-lg", "space-x-4")}>
          <span>{t`LP Positions`} </span>
          {numLPs > 0 ? (
            <Tag
              round
              className={classNames(styles.skinnyTag, tw("font-bold"))}
            >
              {numLPs}
            </Tag>
          ) : null}
        </div>
      </Tab>
    </Tabs>
  );
}
