import React, { FC } from "react";

import { Classes, H2, Tag } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { AbstractConnector } from "@web3-react/abstract-connector";
import classNames from "classnames";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { WalletConnectionCard } from "efi-ui/wallets/WalletConnectionCard/WalletConnectionCard";
import { getConnectorName } from "efi/wallets/connectors";

interface MintViewTitleProps {
  account: string | null | undefined;
  active: boolean;
  chainId: number | undefined;
  connector: AbstractConnector | undefined;
  library: Web3Provider | undefined;
}

const subtitleClassName = classNames(
  Classes.RUNNING_TEXT,
  Classes.TEXT_MUTED,
  tw("text-base")
);

export const MintViewTitle: FC<MintViewTitleProps> = ({
  account,
  active,
  chainId,
  connector,
  library,
}) => {
  const connectorName = getConnectorName(connector, library);
  return (
    <div className={tw("flex", "justify-between", "w-full")}>
      <div className={tw("flex", "flex-col", "justify-start", "flex-1")}>
        <H2 className={tw("mb-4")}>
          {t`Mint Yield Tokens`}{" "}
          <sup>
            <Tag>{t`beta`}</Tag>
          </sup>
        </H2>
        <span className={subtitleClassName}>
          {t`A concise description of Minting makes it clear to the user why FYTs and YCs are useful to them.`}
        </span>
      </div>

      <div className={tw("flex")}>
        <WalletConnectionCard
          className={tw("flex")}
          account={account}
          active={active}
          chainId={chainId}
          connectorName={connectorName}
        />
      </div>
    </div>
  );
};
