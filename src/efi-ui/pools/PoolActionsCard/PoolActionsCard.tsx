import { ReactElement, useCallback, useEffect } from "react";

import { Card, Intent, Tab, Tabs } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import Link from "next/link";
import { useRouter } from "next/router";
import { TokenInfo } from "@uniswap/token-lists";
import { Signer } from "ethers";
import { PrincipalTokenInfo } from "@elementfi/tokenlist";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { useParams } from "efi-ui/router/useParams";
import { PoolAction } from "efi-ui/pools/hooks/usePoolViewPoolActionsPref/usePoolViewPoolActionsPref";
import { StakingPanel } from "efi-ui/pools/StakingPanel/StakingPanel";
import { UnstakeCard } from "efi-ui/pools/UnstakingPanel/UnstakingCard";
import { RedeemPanel } from "efi-ui/redeem/RedeemPanel/RedeemPanel";
import { TradePanel } from "efi-ui/trade/TradePanel/TradePanel";
import { getOppositePoolInfo } from "efi/pools/getOppositePoolInfo";
import { PoolInfo } from "efi/pools/PoolInfo";
import { isYieldPool } from "efi/pools/weightedPool";
import { getTokenInfo } from "efi/tokenlists/tokenlists";
import { getIsMature } from "efi/tranche/getIsMature";

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

  const { push: navigate, asPath } = useRouter();

  // The active tab state is kept in a URL query parameter.
  const { action: activeTab = PoolAction.BUY } = useParams();

  // remove possible query sring and/or hash from url
  const currentPath = asPath.replace(/(\?|#).*/, "");

  // safety measure to make sure we end up on a tab that exists
  useEffect(() => {
    if (isRedeemable && activeTab === PoolAction.BUY) {
      navigate(`${currentPath}?action=${PoolAction.REDEEM}`, undefined, {
        shallow: true,
      });
    }
    if (isRedeemable && activeTab === PoolAction.SELL) {
      navigate(`${currentPath}?action=${PoolAction.REDEEM}`, undefined, {
        shallow: true,
      });
    }
    if (isRedeemable && activeTab === PoolAction.ADD_LIQUIDITY) {
      navigate(
        `${currentPath}?action=${PoolAction.REMOVE_LIQUIDITY}`,
        undefined,
        { shallow: true }
      );
    }
    if (!isRedeemable && activeTab === PoolAction.REDEEM) {
      navigate(`${currentPath}?action=${PoolAction.BUY}`, undefined, {
        shallow: true,
      });
    }
  }, [activeTab, isRedeemable, currentPath, navigate]);

  const onTabChange = useCallback(
    (newTab: PoolAction) => {
      navigate(`${currentPath}?action=${newTab}`, undefined, { shallow: true });
    },
    [currentPath, navigate]
  );

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
          <Link href={`/pools/${oppositePoolInfo.address}`}>
            <a className={tw("text-center")}>
              {t`Go to ${oppositePoolType} Pool`}
            </a>
          </Link>
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
