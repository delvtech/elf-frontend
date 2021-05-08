import { ReactElement } from "react";

import { Button, Card, Intent } from "@blueprintjs/core";
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

  return (
    <div className={tw("flex", "flex-col", "flex-1", "h-500")}>
      <div className={tw("mb-2", "flex", "space-x-4")}>
        <span>{t`Pool Actions`}</span>
      </div>
      <Card className={tw("flex", "flex-col", "flex-1", "w-full", "space-y-2")}>
        <div className={tw("flex", "space-x-4")}>
          <Button
            onClick={() => setTab(PoolAction.SWAP)}
            active={tab === PoolAction.SWAP}
            minimal
            outlined
            intent={Intent.PRIMARY}
          >{t`Trade`}</Button>
          <Button
            onClick={() => setTab(PoolAction.STAKE)}
            active={tab === PoolAction.STAKE}
            minimal
            outlined
            intent={Intent.PRIMARY}
          >{t`Stake`}</Button>
          <Button
            onClick={() => setTab(PoolAction.UNSTAKE)}
            active={tab === PoolAction.UNSTAKE}
            minimal
            outlined
            intent={Intent.PRIMARY}
          >{t`Unstake`}</Button>
        </div>
        {tab === PoolAction.SWAP && (
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
            buttonLabel={t`Trade`}
            buttonIntent={Intent.PRIMARY}
          />
        )}
        {tab === PoolAction.STAKE && (
          <StakingPanel
            library={library}
            signer={signer}
            account={account}
            pool={pool}
            buttonLabel={t`Stake`}
            buttonIntent={Intent.PRIMARY}
          />
        )}
        {tab === PoolAction.UNSTAKE && (
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
