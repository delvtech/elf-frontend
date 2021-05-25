import { ReactElement, useEffect, useState } from "react";

import { Card, Intent, Tab, Tabs } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { AbstractConnector } from "@web3-react/abstract-connector";
import { ERC20 } from "elf-contracts/types/ERC20";
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
  pool: PoolContract | undefined;
  poolInfo: PoolInfo;
  tokenIn: ERC20 | undefined;
  tokenOut: ERC20 | undefined;

  firstTokenInfo: TokenInfo;
  secondTokenInfo: TokenInfo;
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
          <Tab id={PoolAction.SWAP} title={t`Trade`} />
          <Tab id={PoolAction.ADD_LIQUIDITY} title={t`Add Liquidity`} />
          <Tab id={PoolAction.REMOVE_LIQUIDITY} title={t`Remove Liquidity`} />
        </Tabs>
        {activeTab === PoolAction.SWAP && (
          <TradePanel
            library={library}
            signer={signer}
            account={account}
            chainId={chainId}
            connector={connector}
            walletActive={walletActive}
            pool={pool}
            poolInfo={poolInfo}
            tokenIn={tokenIn}
            tokenOut={tokenOut}
            buttonLabel={t`Trade`}
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
    if (tab !== PoolAction.SWAP) {
      setTab(PoolAction.SWAP);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
