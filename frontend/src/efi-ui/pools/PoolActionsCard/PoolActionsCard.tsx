import { ReactElement, useEffect, useState } from "react";

import { Card, Intent, Tab, Tabs } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { AbstractConnector } from "@web3-react/abstract-connector";
import { Signer } from "ethers";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { StakingPanel } from "efi-ui/pools/StakingPanel/StakingPanel";
import { UnStakePanel } from "efi-ui/pools/UnStakePanel/UnStakePanel";
import {
  PoolAction,
  usePoolViewPoolActionsTab,
} from "efi-ui/pools/usePoolViewPoolActionsPref/usePoolViewPoolActionsPref";
import { TradePanel } from "efi-ui/trade/TradePanel/TradePanel";
import { PoolContract } from "efi/pools/PoolContract";
import { TokenInfo } from "@uniswap/token-lists";
import { PoolInfo } from "efi/pools/PoolInfo";

interface PoolActionsCardProps {
  library: Web3Provider | undefined;
  signer: Signer | undefined;
  account: string | null | undefined;
  chainId: number | undefined;
  connector: AbstractConnector | undefined;
  walletActive: boolean;
  pool: PoolContract;
  poolInfo: PoolInfo;
  baseTokenInfo: TokenInfo;
  termTokenInfo: TokenInfo;
}

export function PoolActionsCard(props: PoolActionsCardProps): ReactElement {
  const {
    library,
    signer,
    account,
    chainId,
    connector,
    walletActive,
    baseTokenInfo,
    termTokenInfo,
    pool,
    poolInfo,
  } = props;
  const { tab, setTab } = usePoolViewPoolActionsTab();
  const [activeTab, setActiveTab] = useState(tab);
  useClearTab(tab, setTab);

  return (
    <div className={tw("flex", "flex-col", "flex-1", "h-500")}>
      <div className={tw("mb-2", "flex", "space-x-4")}>
        <span>{t`Pool Actions`}</span>
      </div>
      <Card className={tw("flex", "flex-col", "flex-1", "w-full", "space-y-2")}>
        <Tabs onChange={setActiveTab as (newTabId: PoolAction) => void}>
          <Tab id={PoolAction.BUY} title={t`Buy`} />
          <Tab id={PoolAction.SELL} title={t`Sell`} />
          <Tab id={PoolAction.ADD_LIQUIDITY} title={t`Add Liquidity`} />
          <Tab id={PoolAction.REMOVE_LIQUIDITY} title={t`Remove Liquidity`} />
        </Tabs>
        {activeTab === PoolAction.BUY && (
          <TradePanel
            library={library}
            signer={signer}
            account={account}
            chainId={chainId}
            connector={connector}
            walletActive={walletActive}
            pool={pool}
            poolInfo={poolInfo}
            tokenIn={baseTokenInfo}
            tokenOut={termTokenInfo}
            buttonLabel={t`Buy`}
            buttonIntent={Intent.PRIMARY}
          />
        )}
        {activeTab === PoolAction.SELL && (
          <TradePanel
            library={library}
            signer={signer}
            account={account}
            chainId={chainId}
            connector={connector}
            walletActive={walletActive}
            pool={pool}
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
            pool={pool}
            buttonLabel={t`Stake`}
            buttonIntent={Intent.PRIMARY}
          />
        )}
        {activeTab === PoolAction.REMOVE_LIQUIDITY && (
          <UnStakePanel
            library={library}
            account={account}
            pool={pool}
            connector={connector}
          />
        )}
      </Card>
    </div>
  );
}

// one time use effect to set the default back to swap.
function useClearTab(tab: PoolAction, setTab: (tab: PoolAction) => void) {
  useEffect(() => {
    if (tab !== PoolAction.BUY) {
      setTab(PoolAction.BUY);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
