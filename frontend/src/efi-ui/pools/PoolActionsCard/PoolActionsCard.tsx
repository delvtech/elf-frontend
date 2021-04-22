import { ReactElement, useCallback, useState } from "react";

import { Card, Intent, Tab, Tabs } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { AbstractConnector } from "@web3-react/abstract-connector";
import { ERC20 } from "elf-contracts/types/ERC20";
import { Signer } from "ethers";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { StakingPanel } from "efi-ui/pools/StakingPanel/StakingPanel";
import { UnStakePanel } from "efi-ui/pools/UnStakePanel/UnStakePanel";
import { TradePanel } from "efi-ui/trade/TradePanel/TradePanel";
import { PoolContract } from "efi/pools/PoolContract";

import styles from "./PoolActionsCard.module.css";

interface PoolActionsCardProps {
  library: Web3Provider | undefined;
  signer: Signer | undefined;
  account: string | null | undefined;
  chainId: number | undefined;
  connector: AbstractConnector | undefined;
  walletActive: boolean;
  pool: PoolContract | undefined;
  tokenIn: ERC20 | undefined;
  tokenOut: ERC20 | undefined;
}

enum MarketAction {
  SWAP = "swap",
  STAKE = "stake",
  UNSTAKE = "unstake",
}
export function PoolActionsCard(props: PoolActionsCardProps): ReactElement {
  const {
    library,
    signer,
    account,
    chainId,
    connector,
    walletActive,
    tokenIn,
    tokenOut,
    pool,
  } = props;
  const [activeTab, setActiveTab] = useState<MarketAction>(MarketAction.SWAP);

  const onChangeTab = useCallback(
    (tabId: MarketAction) => setActiveTab(tabId),
    []
  );
  return (
    <div className={tw("flex", "flex-col", "flex-1", "h-500", "w-3/10")}>
      <Tabs
        id="tabs-pool-actions"
        selectedTabId={activeTab}
        className={styles.smTabs}
        onChange={onChangeTab}
      >
        <Tab id={MarketAction.SWAP}>{t`Swap`}</Tab>
        <Tab id={MarketAction.STAKE}>{t`Add liquidity`}</Tab>
        <Tab id={MarketAction.UNSTAKE}>{t`Remove liquidity`}</Tab>
      </Tabs>
      <Card
        className={tw("flex", "flex-col", "flex-1", "w-full", "transition-all")}
      >
        {activeTab === "swap" && (
          <TradePanel
            library={library}
            signer={signer}
            account={account}
            chainId={chainId}
            connector={connector}
            walletActive={walletActive}
            pool={pool}
            tokenIn={tokenIn}
            tokenOut={tokenOut}
            inputLabel={t`Trade`}
            buttonLabel={t`Trade`}
            buttonIntent={Intent.PRIMARY}
            onTransaction={() => {}}
          />
        )}
        {activeTab === "stake" && (
          <StakingPanel
            library={library}
            signer={signer}
            account={account}
            chainId={chainId}
            connector={connector}
            walletActive={walletActive}
            pool={pool}
            inputLabel={t`Stake`}
            buttonLabel={t`Stake`}
            buttonIntent={Intent.PRIMARY}
            onTransaction={() => {}}
          />
        )}
        {activeTab === "unstake" && (
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
