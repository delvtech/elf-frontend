import React, { FC } from "react";

import { Classes, H2 } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { RouteComponentProps } from "@reach/router";
import { useWeb3React } from "@web3-react/core";
import classNames from "classnames";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { MarketCard } from "efi-ui/markets/MarketCard/MarketCard";
import { WalletConnectionCard } from "efi-ui/wallets/WalletConnectionCard/WalletConnectionCard";
import { ElfStrategyLowRisk } from "efi/pools/lowRisk";
import { getConnectorName } from "efi/wallets/connectors";
import { MarketActionsCard } from "efi-ui/markets/MarketActionsCard/MarketActionsCard";

interface MarketViewProps extends RouteComponentProps {}

export const MarketView: FC<MarketViewProps> = () => {
  const {
    active,
    account,
    chainId,
    connector,
    library,
  } = useWeb3React<Web3Provider>();

  const connectorName = getConnectorName(connector, library);
  return (
    <div
      className={tw("flex", "p-12", "h-full", "space-x-12", "overflow-scroll")}
    >
      {/* Main content */}
      <div className={tw("flex", "flex-col", "flex-1", "space-y-12")}>
        {/* page title */}
        <div className={tw("flex", "justify-between")}>
          <div className={tw("flex", "flex-col", "justify-start")}>
            <H2 className={tw("mb-4")}>{t`Element Market`}</H2>
            <span
              className={classNames(
                Classes.RUNNING_TEXT,
                Classes.TEXT_MUTED,
                tw("text-base")
              )}
            >{t`Provide liquidity for this market, or trade for what you want.`}</span>
          </div>
          <WalletConnectionCard
            active={active}
            account={account}
            chainId={chainId}
            connectorName={connectorName}
          />
        </div>

        <div className={tw("flex", "justify-between", "space-x-12")}>
          <MarketCard pool={ElfStrategyLowRisk} />
          <div className={tw("w-500")}>
            <MarketActionsCard pool={ElfStrategyLowRisk} />
          </div>
        </div>
      </div>
    </div>
  );
};
