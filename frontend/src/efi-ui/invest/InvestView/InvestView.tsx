import React, { FC, Fragment } from "react";

import { Web3Provider } from "@ethersproject/providers";
import { RouteComponentProps } from "@reach/router";
import { useWeb3React } from "@web3-react/core";
import { jt, t } from "ttag";

import { ReactComponent as UsdcIcon } from "efi-static-assets/logos/svg/USDC.svg";
import tw from "efi-tailwindcss-classnames";
import { EthIcon } from "efi-ui/crypto/EthIcon";
import { InvestCard } from "efi-ui/invest/InvestView/InvestCard";
import { ViewTitle } from "efi-ui/page/ViewTitle/ViewTitle";
import { BaseAsset } from "efi-ui/invest/InvestView/BaseAssetPicker";
import { YieldPosition } from "efi-ui/invest/InvestView/YieldPositionPicker";
import { CryptoName } from "efi/crypto/CryptoName";

// const baseAssetInfos: Omit<InvestCardProps, "onInvestmentAmountChange">[] = [
//   {
//     id: "base-asset-eth",
//     assetIcon: EthIcon,
//     assetName: "Ethereum",
//     assetSymbol: "fyETH",
//     baseAssetSymbol: "ETH",
//     assetPrice: "1,000 USD",
//     yieldPositions: [
//       {
//         id: "MKRVaultDAIDelegate",
//         name: "WETH Yearn vault",
//         maturity: "Feb 15, 2021",
//         apy: "3.13%",
//       },
//     ],
//     walletBalance: "123.456789",
//     walletBalanceFiat: "123,456",
//   },
//   {
//     id: "base-asset-usdc",
//     assetIcon: UsdcIcon,
//     assetName: "USD Coin",
//     assetSymbol: "fyUSDC",
//     baseAssetSymbol: "USDC",
//     assetPrice: "1.00 USD",
//     yieldPositions: [
//       {
//         id: "USDC3pool",
//         name: "USDC Yearn vault",
//         apy: "10.98%",
//         maturity: "Feb 15, 2021",
//       },
//     ],
//     walletBalance: "123.45",
//     walletBalanceFiat: "123.45",
//   },
// ];

const baseAssets: BaseAsset[] = [
  {
    id: "base-asset-eth",
    name: CryptoName.ETH,
    symbol: "ETH",
    assetIcon: EthIcon,
    fiatPrice: "$1,000.00",
  },
  {
    id: "base-asset-usdc",
    name: CryptoName.USDC,
    symbol: "USDC",
    assetIcon: UsdcIcon,
    fiatPrice: "$1.00",
  },
];

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
          "pt-16",
          "items-center"
        )}
      >
        <div
          className={tw("flex", "flex-col", "space-y-12")}
          style={{ width: 640 }}
        >
          <div className={tw("flex", "flex-1", "justify-center")}>
            {/* <div
              className={tw(
                "flex",
                "space-x-4",
                "items-center",
                "text-lg",
                "justify-end"
              )}
            >
              <Icon
                icon={IconNames.OIL_FIELD}
                iconSize={48}
                color={Colors.GRAY1}
              />
              <LabeledText text={"400 gwei"} label={"gas price"} />
            </div> */}
          </div>
          <InvestCard baseAssets={baseAssets} yieldPositions={yieldPositions} />
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
    <Fragment>{jt`Fixed Yield assets are redeemable one-to-one with their base asset once they mature. ${fixedYieldLink}`}</Fragment>
  );
};
