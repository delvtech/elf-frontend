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
import { BaseAsset } from "efi-ui/invest/types/BaseAsset";
import { YieldPosition } from "efi-ui/invest/InvestView/YieldPositionPicker";
import { CryptoName } from "efi/crypto/CryptoName";
import { Colors, Icon } from "@blueprintjs/core";
import { IconName, IconNames } from "@blueprintjs/icons";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";

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

  const widgets = [
    {
      id: "wallet-balance",
      icon: IconNames.BANK_ACCOUNT as IconName,
      value: "12.34 ETH",
      label: t`in this wallet`,
    },
    {
      id: "price",
      icon: IconNames.DOLLAR as IconName,
      value: "$1,434.25 USD",
      label: t`ETH price`,
    },
    {
      id: "gas-price",
      icon: IconNames.OIL_FIELD as IconName,
      value: "80 gwei",
      label: t`gas price`,
    },
  ];

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
          "pt-16",
          "items-center"
        )}
      >
        <div
          className={tw("flex", "flex-col", "space-y-12")}
          style={{ width: 640 }}
        >
          <div
            className={tw("flex", "flex-1", "justify-between", "items-center")}
          >
            {widgets.map(({ icon, label, value }) => {
              return (
                <LabeledText
                  large
                  text={value}
                  label={label}
                  icon={<Icon icon={icon} iconSize={48} color={Colors.GRAY1} />}
                />
              );
            })}
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
    <Fragment>{jt`Fixed Yield assets are redeemable one-to-one with their base asset once they have reached their maturity date. ${fixedYieldLink}`}</Fragment>
  );
};
