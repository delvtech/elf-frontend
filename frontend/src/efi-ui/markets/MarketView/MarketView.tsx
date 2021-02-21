import React, { FC } from "react";

import { Classes, H2 } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { RouteComponentProps } from "@reach/router";
import { useWeb3React } from "@web3-react/core";
import classNames from "classnames";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { MarketDetails } from "efi-ui/markets/MarketDetails/MarketDetails";
import { WalletConnectionCard } from "efi-ui/wallets/WalletConnectionCard/WalletConnectionCard";
import { getConnectorName } from "efi/wallets/connectors";
import { useMarketContract } from "efi-ui/markets/useMarketContract";
import { Signer } from "ethers";

interface MarketViewProps extends RouteComponentProps {
  marketId?: string;
}

export const MarketView: FC<MarketViewProps> = (props) => {
  const { marketId } = props;
  const {
    active,
    account,
    chainId,
    connector,
    library,
  } = useWeb3React<Web3Provider>();
  const signer = account ? (library?.getSigner(account) as Signer) : undefined;
  const connectorName = getConnectorName(connector, library);
  const marketContract = useMarketContract(marketId, signer);

  return (
    <div
      data-testid="market-view"
      className={tw("flex", "p-12", "h-full", "space-x-12", "overflow-scroll")}
    >
      {/* Main content */}
      <div className={tw("flex", "flex-col", "flex-1", "space-y-8")}>
        {/* page title */}
        <div className={tw("flex", "justify-between")}>
          <div className={tw("flex", "flex-col", "justify-start")}>
            <H2 className={tw("mb-4")}>{t`ETH - fyETH Market`}</H2>
            <span
              className={classNames(
                Classes.RUNNING_TEXT,
                Classes.TEXT_MUTED,
                tw("text-base")
              )}
            >{t`Trade for either asset or provide liquidity for this market.`}</span>
          </div>
          <WalletConnectionCard
            active={active}
            account={account}
            chainId={chainId}
            connectorName={connectorName}
          />
        </div>
        <div className={tw("flex", "flex-col", "justify-between")}>
          <MarketDetails
            signer={signer}
            accountAddress={account}
            marketContract={marketContract}
          />
        </div>
      </div>
    </div>
  );
};
