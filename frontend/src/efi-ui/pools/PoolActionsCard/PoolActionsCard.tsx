import React, { ReactElement, useCallback, useState } from "react";

import { Card, Colors, Intent } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { AbstractConnector } from "@web3-react/abstract-connector";
import { ERC20 } from "elf-contracts/types/ERC20";
import { Signer } from "ethers";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
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

type MarketAction = "trade" | "stake";
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
  const [action, setActionUI] = useState<MarketAction>("trade");
  const showTradeUI = useCallback(() => setActionUI("trade"), []);
  const showStakeUI = useCallback(() => setActionUI("stake"), []);

  return (
    <div className={tw("flex", "flex-col", "flex-1", "h-500", "w-3/10")}>
      <div className={tw("mb-2", "space-x-4")}>
        <button
          aria-label="trade"
          onClick={showTradeUI}
          style={{ color: Colors.BLUE5 }}
        >{t`Trade`}</button>
        <button onClick={showStakeUI} aria-label="stake">{t`Stake`}</button>
      </div>
      <Card
        className={tw("flex", "flex-col", "flex-1", "w-full", "transition-all")}
      >
        {action === "trade" && (
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
        {action === "stake" && (
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
            inputLabel={t`Stake`}
            buttonLabel={t`Stake`}
            buttonIntent={Intent.PRIMARY}
            onTransaction={() => {}}
          />
        )}
      </Card>
    </div>
  );
}
