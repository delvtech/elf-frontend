import React, { FC, Fragment } from "react";

import { Web3Provider } from "@ethersproject/providers";
import { RouteComponentProps } from "@reach/router";
import { useWeb3React } from "@web3-react/core";
import { jt, t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { EthereumPriceWidget } from "efi-ui/ethereum/EthereumPriceWidget/EthereumPriceWidget";
import { GasPriceWidget } from "efi-ui/ethereum/GasPriceWidget/GasPriceWidget";
import { baseAssets } from "efi-ui/invest/baseAssets";
import { InvestCard } from "efi-ui/invest/InvestView/InvestCard";
import { YieldPosition } from "efi-ui/invest/InvestView/YieldPositionPicker";
import { ViewTitle } from "efi-ui/page/ViewTitle/ViewTitle";
import { EthereumBalanceWidget } from "efi-ui/wallets/EthereumBalanceWidget/EthereumBalanceWidget";

const yieldPositions: YieldPosition[] = [
  {
    id: "yield-position-usdc",
    name: "Fixed Rate USDC",
    symbol: "fyUSDC",
    apy: 10.98,
    maturity: "Feb 15, 2021",
    baseAssetSymbol: "USDC",
  },
  {
    id: "yield-position-eth",
    name: "Fixed Rate Ethereum",
    maturity: "Feb 15, 2021",
    apy: 3.13,
    baseAssetSymbol: "ETH",
    symbol: "fyETH",
  },
];

interface InvestViewProps extends RouteComponentProps {}

export const InvestView: FC<InvestViewProps> = () => {
  const {
    account,
    active,
    chainId,
    connector,
    library,
  } = useWeb3React<Web3Provider>();

  return (
    <div
      data-testid="invest-view"
      className={tw(
        "flex",
        "flex-col",
        "p-12",
        "h-full",
        "space-y-12",
        "overflow-scroll"
      )}
    >
      {/* page title */}
      <ViewTitle
        title={t`Invest`}
        subtitle={<InvestViewSubtitle />}
        account={account}
        active={active}
        chainId={chainId}
        connector={connector}
        library={library}
      />

      {/* Main content */}
      <div
        className={tw(
          "flex",
          "flex-col",
          "flex-1",
          "space-y-12",
          "pt-12",
          "items-center"
        )}
      >
        <div
          className={tw("flex", "flex-col", "space-y-12")}
          style={{ width: 640 }}
        >
          <div className={tw("grid", "grid-cols-3")}>
            {account && (
              <EthereumBalanceWidget library={library} account={account} />
            )}
            <EthereumPriceWidget />
            <GasPriceWidget />
          </div>
          <InvestCard
            library={library}
            account={account}
            baseAssets={baseAssets}
            yieldPositions={yieldPositions}
          />
        </div>
      </div>
    </div>
  );
};

const InvestViewSubtitle: FC = () => {
  const fixedYieldLink = (
    <a key="fixed-yield-link" href={"/invest"}>
      {t`Read more about Fixed Yield.`}
    </a>
  );

  return (
    <Fragment>{jt`Fixed Yield assets are redeemable one-to-one with their base asset once they have reached their maturity date. ${fixedYieldLink}`}</Fragment>
  );
};
