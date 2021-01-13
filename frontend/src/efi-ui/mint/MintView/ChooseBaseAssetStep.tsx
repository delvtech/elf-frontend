import {
  Button,
  Callout,
  Card,
  Classes,
  H4,
  IconName,
  Intent,
  UL,
} from "@blueprintjs/core";
import React, { FC } from "react";
import { jt, t } from "ttag";
import tw from "efi-tailwindcss-classnames";
import { ReactComponent as WethIcon } from "efi-static-assets/logos/svg/WETH.svg";
import { ReactComponent as UsdcIcon } from "efi-static-assets/logos/svg/USDC.svg";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";

interface ChooseBaseAssetStepProps {
  account: string | null | undefined;
}
export interface BaseAssetInfo {
  icon: JSX.Element | IconName;
  assetName: string;
  assetSymbol: string;

  assetPrice: string;
  walletBalance: string | JSX.Element;
}

const baseAssetInfos: BaseAssetInfo[] = [
  {
    icon: <WethIcon height={50} width={50} />,
    assetName: "Wrapped Ethereum",
    assetSymbol: "WETH",
    assetPrice: "1,000 USD",
    walletBalance: (
      <LabeledText text={"123.456789 WETH"} label={"123,456 USD"} />
    ),
  },
  {
    icon: <UsdcIcon height={50} width={50} />,
    assetName: "USD Coin",
    assetSymbol: "USDC",
    assetPrice: "1.01 USD",
    walletBalance: <LabeledText text={"123.45 USDC"} label={"123.45 USD"} />,
  },
];

export const ChooseBaseAssetStep: FC<ChooseBaseAssetStepProps> = ({
  account,
}) => {
  // TODO: check wallet for this
  const hasSupportedAssets = true;

  return (
    <div
      className={tw("flex", "flex-col", "space-y-10", "items-center", "w-1/2")}
    >
      <div className={tw("flex", "space-x-10", "w-full")}>
        {baseAssetInfos.map(
          ({ assetName, assetSymbol, assetPrice, icon, walletBalance }) => {
            return (
              <Card key={assetName} className={tw("flex-1")}>
                <div
                  className={tw(
                    "flex",
                    "flex-col",
                    "p-4",
                    "space-y-10",
                    "w-full"
                  )}
                >
                  <div className={tw("flex", "w-full", "space-x-4")}>
                    <div>{icon}</div>
                    <div>
                      <H4>{assetName}</H4>
                      <span
                        className={Classes.TEXT_LARGE}
                      >{t`1 ${assetSymbol} = ${assetPrice}`}</span>
                    </div>
                  </div>
                  <div className={tw("flex", "w-full", "justify-between")}>
                    <div className={tw("grid", "grid-cols-2", "w-full")}>
                      <span>{t`Your balance:`}</span> {walletBalance}
                    </div>
                  </div>
                  <Button outlined large intent={Intent.PRIMARY}>
                    {t`Mint with ${assetSymbol}`}
                  </Button>
                </div>
              </Card>
            );
          }
        )}
      </div>

      {/* Different callouts help guide the UX */}
      {!account ? <NoWalletConnectedCallout /> : null}
      {!hasSupportedAssets && <NoSupportedBaseAssetsCallout />}
    </div>
  );
};

const NoSupportedBaseAssetsCallout: FC<{}> = () => {
  const convertEthToWethLink = (
    <a key="convert-eth-to-weth-link" href="/">{t`convert ETH to WETH`}</a>
  );

  return (
    <Callout intent={Intent.DANGER} icon={null}>
      <div className={tw("p-6")}>
        <H4>{t`There are no supported base assets in this wallet.`}</H4>
        <span>
          {t`You can still explore the minting process, however you'll need one of the supported base assets if you wish to mint yield tokens.`}
        </span>
        <UL>
          <li className={tw("list-disc")}>{t`Switch to a different wallet`}</li>
          <li
            className={tw("list-disc")}
          >{jt`Learn how to ${convertEthToWethLink}`}</li>
        </UL>
      </div>
    </Callout>
  );
};

const NoWalletConnectedCallout: FC<{}> = () => {
  const connectYourWalletLink = (
    <a key="connect-your-wallet-link" href="/">{t`connect your wallet`}</a>
  );
  return (
    <Callout intent={Intent.PRIMARY} icon={null}>
      <div className={tw("p-6")}>
        <H4>{t`More information is available when you connect your wallet`}</H4>
        <span>{jt`Don't worry, you can still explore the minting process, but we'll show your balances and other relevant info when you ${connectYourWalletLink}.`}</span>
      </div>
    </Callout>
  );
};
