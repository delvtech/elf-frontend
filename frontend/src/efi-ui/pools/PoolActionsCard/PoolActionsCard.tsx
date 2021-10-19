import { ReactElement, useCallback } from "react";

import { Card, Intent, Tab, Tabs } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { TokenInfo } from "@uniswap/token-lists";
import { Signer } from "ethers";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { StakingPanel } from "efi-ui/pools/StakingPanel/StakingPanel";
import { UnstakeCard } from "efi-ui/pools/UnstakingPanel/UnstakingCard";
import { PoolAction } from "efi-ui/pools/hooks/usePoolViewPoolActionsPref/usePoolViewPoolActionsPref";
import { TradePanel } from "efi-ui/trade/TradePanel/TradePanel";
import { PoolInfo } from "efi/pools/PoolInfo";
import { getOppositePoolInfo } from "efi/pools/getOppositePoolInfo";
import { isYieldPool } from "efi/pools/weightedPool";
import { Link, navigate, useLocation } from "@reach/router";

import styles from "./PoolActionsCard.module.css";

interface PoolActionsCardProps {
  library: Web3Provider | undefined;
  signer: Signer | undefined;
  account: string | null | undefined;
  poolInfo: PoolInfo;
  poolAction: PoolAction;
  baseTokenInfo: TokenInfo;
  termTokenInfo: TokenInfo;
}

export function PoolActionsCard(props: PoolActionsCardProps): ReactElement {
  const { library, signer, account, baseTokenInfo, termTokenInfo, poolInfo } =
    props;

  // The active tab state is kept in a URL query parameter.
  const { search } = useLocation();
  const urlSearchParams = new URLSearchParams(search);
  const { action: activeTab = PoolAction.BUY } = Object.fromEntries(
    urlSearchParams.entries()
  );
  const onTabChange = useCallback((newTab: PoolAction) => {
    navigate(`?action=${newTab}`);
  }, []);

  const oppositePoolInfo = getOppositePoolInfo(poolInfo);
  const oppositePoolType = isYieldPool(oppositePoolInfo)
    ? t`Yield`
    : t`Principal`;

  return (
    <div className={tw("flex", "flex-col", "h-500")}>
      <div className={tw("mb-2", "flex", "space-x-4")}>
        <span>{t`Pool Actions`}</span>
      </div>
      <Card className={tw("flex", "flex-col", "flex-1", "w-full", "space-y-2")}>
        <div
          className={tw(
            "flex",
            "flex-wrap-reverse",
            "justify-between",
            "items-center"
          )}
        >
          <Tabs
            selectedTabId={activeTab}
            onChange={onTabChange}
            className={styles.poolActionsCard}
          >
            <Tab id={PoolAction.BUY} title={t`Buy`} />
            <Tab id={PoolAction.SELL} title={t`Sell`} />
            <Tab id={PoolAction.ADD_LIQUIDITY} title={t`Add LP`} />
            <Tab id={PoolAction.REMOVE_LIQUIDITY} title={t`Remove LP`} />
          </Tabs>
          <Link
            to={`/pools/${oppositePoolInfo.address}`}
            className={tw("text-center")}
          >{t`Go to ${oppositePoolType} Pool`}</Link>
        </div>
        {activeTab === PoolAction.BUY && (
          <TradePanel
            tradeType="buy"
            library={library}
            signer={signer}
            account={account}
            poolInfo={poolInfo}
            tokenIn={baseTokenInfo}
            tokenOut={termTokenInfo}
            buttonLabel={t`Buy`}
            buttonIntent={Intent.PRIMARY}
          />
        )}
        {activeTab === PoolAction.SELL && (
          <TradePanel
            tradeType="sell"
            library={library}
            signer={signer}
            account={account}
            poolInfo={poolInfo}
            tokenIn={termTokenInfo}
            tokenOut={baseTokenInfo}
            buttonLabel={t`Sell`}
            buttonIntent={Intent.PRIMARY}
          />
        )}
        {activeTab === PoolAction.ADD_LIQUIDITY && (
          <StakingPanel
            library={library}
            signer={signer}
            account={account}
            poolInfo={poolInfo}
            buttonLabel={t`Add Liquidity`}
            buttonIntent={Intent.PRIMARY}
          />
        )}
        {activeTab === PoolAction.REMOVE_LIQUIDITY && (
          <UnstakeCard
            library={library}
            signer={signer}
            account={account}
            poolInfo={poolInfo}
          />
        )}
      </Card>
    </div>
  );
}
