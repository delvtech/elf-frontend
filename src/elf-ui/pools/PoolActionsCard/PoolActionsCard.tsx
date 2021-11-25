import { ReactElement, useCallback, useEffect } from "react";

import { Card, Intent, Tab, Tabs } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { Link, navigate, useLocation } from "@reach/router";
import { TokenInfo } from "@uniswap/token-lists";
import { Signer } from "ethers";
import { PrincipalTokenInfo } from "tokenlists/types";
import { t } from "ttag";

import tw from "elf-tailwindcss-classnames";
import { PoolAction } from "elf-ui/pools/hooks/usePoolViewPoolActionsPref/usePoolViewPoolActionsPref";
import { StakingPanel } from "elf-ui/pools/StakingPanel/StakingPanel";
import { UnstakeCard } from "elf-ui/pools/UnstakingPanel/UnstakingCard";
import { RedeemPanel } from "elf-ui/redeem/RedeemPanel/RedeemPanel";
import { TradePanel } from "elf-ui/trade/TradePanel/TradePanel";
import { getOppositePoolInfo } from "elf/pools/getOppositePoolInfo";
import { PoolInfo } from "elf/pools/PoolInfo";
import { isYieldPool } from "elf/pools/weightedPool";
import { getTokenInfo } from "elf/tokenlists";
import { getIsMature } from "elf/tranche/getIsMature";

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

  const principalTokenInfo = getTokenInfo<PrincipalTokenInfo>(
    termTokenInfo.address
  );

  const { unlockTimestamp } = principalTokenInfo.extensions;
  const isRedeemable = getIsMature(unlockTimestamp);

  // The active tab state is kept in a URL query parameter.
  const { search } = useLocation();
  const urlSearchParams = new URLSearchParams(search);
  const { action: activeTab = PoolAction.BUY } = Object.fromEntries(
    urlSearchParams.entries()
  );

  // safety measure to make sure we end up on a tab that exists
  useEffect(() => {
    if (isRedeemable && activeTab === PoolAction.BUY) {
      navigate(`?action=${PoolAction.REDEEM}`);
    }
    if (isRedeemable && activeTab === PoolAction.SELL) {
      navigate(`?action=${PoolAction.REDEEM}`);
    }
    if (isRedeemable && activeTab === PoolAction.ADD_LIQUIDITY) {
      navigate(`?action=${PoolAction.REMOVE_LIQUIDITY}`);
    }
    if (!isRedeemable && activeTab === PoolAction.REDEEM) {
      navigate(`?action=${PoolAction.BUY}`);
    }
  }, [activeTab, isRedeemable]);

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
            {!isRedeemable && <Tab id={PoolAction.BUY} title={t`Buy`} />}
            {!isRedeemable && <Tab id={PoolAction.SELL} title={t`Sell`} />}
            {isRedeemable && <Tab id={PoolAction.REDEEM} title={t`Redeem`} />}
            {!isRedeemable && (
              <Tab id={PoolAction.ADD_LIQUIDITY} title={t`Add LP`} />
            )}
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
        {activeTab === PoolAction.REDEEM && (
          <RedeemPanel
            library={library}
            account={account}
            poolInfo={poolInfo}
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
