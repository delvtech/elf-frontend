import React, { FC, Fragment, ReactNode } from "react";

import { Classes, H2, Tag } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { AbstractConnector } from "@web3-react/abstract-connector";
import classNames from "classnames";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { WalletConnectionCard } from "efi-ui/wallets/WalletConnectionCard/WalletConnectionCard";
import { getConnectorName } from "efi/wallets/connectors";

interface ViewTitleProps {
  account: string | null | undefined;
  active: boolean;
  chainId: number | undefined;
  connector: AbstractConnector | undefined;
  library: Web3Provider | undefined;
  title: ReactNode;
  subtitle: ReactNode;
  /**
   * Whether or not to show the beta tag
   */
  beta?: boolean;
}

const subtitleClassName = classNames(
  Classes.RUNNING_TEXT,
  Classes.TEXT_MUTED,
  tw("text-base")
);

export const ViewTitle: FC<ViewTitleProps> = ({
  account,
  active,
  chainId,
  connector,
  library,
  title,
  subtitle,
  beta,
}) => {
  const connectorName = getConnectorName(connector, library);
  return (
    <div className={tw("flex", "justify-between", "w-full")}>
      <div
        className={tw("flex", "flex-col", "justify-start", "flex-1", "mr-12")}
      >
        <H2 className={tw("mb-4")}>
          {title}
          {!beta ? null : (
            <Fragment>
              {" "}
              <sup>
                <Tag>{t`beta`}</Tag>
              </sup>
            </Fragment>
          )}
        </H2>

        <span className={subtitleClassName}>{subtitle}</span>
      </div>

      <div className={tw("flex")}>
        <WalletConnectionCard
          className={tw("flex", "w-400")}
          account={account}
          active={active}
          chainId={chainId}
          connectorName={connectorName}
        />
      </div>
    </div>
  );
};
