import React, { FC, ReactNode, useMemo, useState } from "react";

import { Classes } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { RouteComponentProps } from "@reach/router";
import { useWeb3React } from "@web3-react/core";
import classNames from "classnames";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";

import { BaseAssetTabs } from "../BaseAssetTabs/BaseAssetTabs";
import { ViewTitle } from "efi-ui/page/ViewTitle/ViewTitle";
import { MintCard } from "efi-ui/mint/MintCard/MintCard";

interface MintViewProps extends RouteComponentProps {}

export const MintView: FC<MintViewProps> = () => {
  const { account } = useWeb3React<Web3Provider>();

  const [investmentAmount, setInvestmentAmount] = useState(0);

  return (
    <div
      data-testid="mint-view"
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
        title={t`Mint Yield Tokens`}
        subtitle={t`A concise description of Minting makes it clear to the user why FYTs and ITs are useful to them.`}
      />

      {/* Main content */}
      <div className={tw("flex", "flex-col", "flex-1", "space-y-12")}>
        <div
          className={tw(
            "flex",
            "flex-col",
            "space-y-8",
            "w-full",
            "items-center",
            "justify-center"
          )}
        >
          <BaseAssetTabs
            account={account}
            onInvestmentAmountChange={setInvestmentAmount}
          />
          <MintCard
            id={id}
            assetName={assetName}
            assetIcon={AssetIcon}
            assetSymbol={assetSymbol}
            assetPrice={assetPrice}
            walletBalance={walletBalance}
            walletBalanceFiat={walletBalanceFiat}
            yieldPositions={yieldPositions}
            onInvestmentAmountChange={onInvestmentAmountChange}
          />
        </div>
      </div>
    </div>
  );
};
