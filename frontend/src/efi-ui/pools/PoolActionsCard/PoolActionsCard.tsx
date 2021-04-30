import { ReactElement, useCallback, useState } from "react";

import { Button, Card, Intent } from "@blueprintjs/core";
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
    <div className={tw("flex", "flex-col", "flex-1", "h-500")}>
      <div className={tw("mb-2", "flex", "space-x-4")}>
        <span>{t`Pool Actions`}</span>
      </div>
      <Card className={tw("flex", "flex-col", "flex-1", "w-full", "space-y-2")}>
        <div className={tw("flex", "space-x-4")}>
          <Button
            onClick={() => onChangeTab(MarketAction.SWAP)}
            active={activeTab === MarketAction.SWAP}
            minimal
            outlined
            intent={Intent.PRIMARY}
          >{t`Swap`}</Button>
          <Button
            onClick={() => onChangeTab(MarketAction.STAKE)}
            active={activeTab === MarketAction.STAKE}
            minimal
            outlined
            intent={Intent.PRIMARY}
          >{t`Add Liquidity`}</Button>
          <Button
            onClick={() => onChangeTab(MarketAction.UNSTAKE)}
            active={activeTab === MarketAction.UNSTAKE}
            minimal
            outlined
            intent={Intent.PRIMARY}
          >{t`Remove Liquidity`}</Button>
        </div>
        {activeTab === MarketAction.SWAP && (
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
            buttonLabel={t`Swap`}
            buttonIntent={Intent.PRIMARY}
          />
        )}
        {activeTab === MarketAction.STAKE && (
          <StakingPanel
            library={library}
            signer={signer}
            account={account}
            pool={pool}
            buttonLabel={t`Stake`}
            buttonIntent={Intent.PRIMARY}
          />
        )}
        {activeTab === MarketAction.UNSTAKE && (
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
