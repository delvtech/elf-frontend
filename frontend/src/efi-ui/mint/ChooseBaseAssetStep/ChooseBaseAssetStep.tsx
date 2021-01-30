import React, { FC, useState } from "react";

import { Tab, Tabs } from "@blueprintjs/core";

import { ReactComponent as UsdcIcon } from "efi-static-assets/logos/svg/USDC.svg";
import tw from "efi-tailwindcss-classnames";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { EthIcon } from "efi-ui/ethereum/EthIcon";
import { NextStepCallout } from "efi-ui/mint/ChooseBaseAssetStep/NextStepCallout";

import { BaseAssetCard, BaseAssetCardProps } from "./BaseAssetCard";
import { NoWalletConnectedCallout } from "./NoWalletConnectedCallout";

interface ChooseBaseAssetStepProps {
  account: string | null | undefined;
  onInvestmentAmountChange: (amount: number) => void;
}

const baseAssetInfos: Omit<BaseAssetCardProps, "onInvestmentAmountChange">[] = [
  {
    id: "base-asset-eth",
    assetIcon: EthIcon,
    assetName: "Ethereum",
    assetSymbol: "ETH",
    assetPrice: "1,000 USD",
    yieldPositions: [
      { id: "MKRVaultDAIDelegate", name: "WETH Yearn vault", apy: "3.13%" },
    ],
    walletBalance: "123.456789",
    walletBalanceFiat: "123,456",
  },
  {
    id: "base-asset-usdc",
    assetIcon: UsdcIcon,
    assetName: "USD Coin",
    assetSymbol: "USDC",
    assetPrice: "1.00 USD",
    yieldPositions: [
      { id: "USDC3pool", name: "USDC Yearn vault", apy: "10.98%" },
    ],
    walletBalance: "123.45",
    walletBalanceFiat: "123.45",
  },
];

export const ChooseBaseAssetStep: FC<ChooseBaseAssetStepProps> = ({
  account,
  onInvestmentAmountChange,
}) => {
  const showNextStepCallout = !!account;

  const [activeBaseAssetId, setActiveBaseAssetId] = useState(
    baseAssetInfos[0].id
  );

  return (
    <div
      className={tw("flex", "flex-col", "space-y-10", "h-full")}
      style={{ width: 968 }}
    >
      <Tabs
        vertical
        large
        id="base-asset-tabs"
        className={tw("w-full")}
        onChange={(tabId: string) => {
          setActiveBaseAssetId(tabId);
        }}
        selectedTabId={activeBaseAssetId}
      >
        {baseAssetInfos.map(
          ({
            id,
            assetName,
            assetSymbol,
            assetPrice,
            assetIcon: AssetIcon,
            walletBalance,
            walletBalanceFiat,
            yieldPositions,
          }) => {
            return (
              <Tab
                id={id}
                title={
                  <div
                    className={tw(
                      "flex",
                      "p-6",
                      "w-48",
                      "space-x-4",
                      "items-center"
                    )}
                  >
                    <AssetIcon height={24} width={24} />
                    <LabeledText
                      text={assetName}
                      label={assetSymbol}
                      className={tw("leading-none")}
                    />
                  </div>
                }
                panelClassName={tw("flex-1")}
                panel={
                  <BaseAssetCard
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
                }
              />
            );
          }
        )}
      </Tabs>

      {/* Different callouts help guide the UX */}
      {!account ? <NoWalletConnectedCallout /> : null}
      {showNextStepCallout && <NextStepCallout />}
    </div>
  );
};
