import React, { FC, ReactNode } from "react";

import { Button, Callout, Divider, Drawer, Intent } from "@blueprintjs/core";
import classNames from "classnames";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { CryptoAssetWithIcon } from "efi-ui/crypto/CryptoAssetWithIcon";
import { useCryptoName } from "efi-ui/crypto/hooks/useCryptoName/useCryptoName";
import { useCryptoSymbol } from "efi-ui/crypto/hooks/useCryptoSymbol/useCryptoSymbol";
import { TrancheInfo } from "efi-ui/tranche/TrancheInfo";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { WalletConnectionCard } from "efi-ui/wallets/WalletConnectionCard/WalletConnectionCard";
import { AbstractConnector } from "@web3-react/abstract-connector";
import { Web3Provider } from "@ethersproject/providers";
import { getConnectorName } from "efi/wallets/connectors";

interface BuyFYTConfirmationDrawerProps {
  chainId: number | undefined;
  account: string | null | undefined;
  walletConnectionActive: boolean;
  connector: AbstractConnector | undefined;
  library: Web3Provider | undefined;
  title: ReactNode;

  baseAssetQuantity: number;
  baseAsset: CryptoAssetWithIcon;

  trancheInfo: TrancheInfo;
  isOpen: boolean;
  onClose: () => void;
}

export const BuyFYTConfirmationDrawer: FC<BuyFYTConfirmationDrawerProps> = ({
  connector,
  walletConnectionActive,
  library,
  chainId,
  account,
  baseAsset: { assetIcon: AssetIcon },
  baseAsset,
  trancheInfo: {
    apy: trancheAPY,
    symbol: trancheSymbol,
    name: trancheName,
    maturity: trancheMaturity,
  },
  baseAssetQuantity,
  title,
  isOpen,
  onClose,
}) => {
  const { darkModeClassName } = useDarkMode();
  const baseAssetName = useCryptoName(baseAsset);
  const baseAssetSymbol = useCryptoSymbol(baseAsset);

  const connectorName = getConnectorName(connector, library);

  const redeemableQuantity =
    baseAssetQuantity + baseAssetQuantity * (trancheAPY / 100);

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      size={500}
      className={classNames(darkModeClassName, tw("flex", "flex-col"))}
    >
      <WalletConnectionCard
        active={walletConnectionActive}
        connectorName={connectorName}
        account={account}
        chainId={chainId}
      />
      <div
        className={tw(
          "flex",
          "flex-col",
          "flex-1",
          "p-10",
          "justify-end",
          "space-y-10"
        )}
      >
        <div className={tw("flex", "flex-col", "space-y-16")}>
          <div className={tw("flex", "flex-col", "space-y-10")}>
            <span
              className={tw("text-lg")}
            >{t`Investing an initial amount of:`}</span>
            <div className={tw("grid", "w-full", "grid-cols-2", "ml-8")}>
              <div
                className={classNames(
                  tw("flex", "items-center", "font-semibold"),
                  "h3"
                )}
              >{t`${baseAssetQuantity}`}</div>
              <LabeledText
                iconClassName={tw("mr-4")}
                icon={<AssetIcon height={42} width={42} />}
                text={baseAssetSymbol}
                label={baseAssetName}
              />
            </div>
          </div>
          <div className={tw("flex", "flex-col", "space-y-10")}>
            <span
              className={tw("text-lg")}
            >{t`Will accumulate yield until ${trancheMaturity}:`}</span>

            <div className={tw("grid", "w-full", "grid-cols-2", "ml-8")}>
              <div
                className={classNames(
                  tw("flex", "items-center", "font-semibold"),
                  "h3"
                )}
              >{t`${redeemableQuantity.toFixed(9)}`}</div>
              <LabeledText
                iconClassName={tw("mr-4")}
                icon={<AssetIcon height={42} width={42} />}
                text={baseAssetSymbol}
                label={baseAssetName}
              />
            </div>
          </div>
        </div>

        <Divider />

        <Callout
          intent={Intent.PRIMARY}
          title={t`Note:`}
          icon={null}
          className={tw("p-4")}
        >
          <div
            className={"pt-1"}
          >{t`Yield accumulates at a fixed rate. Exit any time.`}</div>
        </Callout>
        <Button
          large
          outlined
          intent={Intent.WARNING}
          onClick={onClose}
        >{t`Confirm transaction`}</Button>
      </div>
    </Drawer>
  );
};
