import React, { FunctionComponent } from "react";

import { Card, Classes, Colors, Icon, Tag } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import classNames from "classnames";

import tw from "efi-tailwindcss-classnames";
import { WalletJazzicon } from "efi-ui/wallets/WalletJazzicon/WalletJazzicon";
import { formatChainName } from "efi/crypto/formatChainName";
import { formatWalletAddress } from "efi/wallets/formatWalletAddress";
import { isMainnet } from "efi/crypto/ethereum";
import { useChangeTab } from "efi-ui/navigation/hooks/useChangeTab";
import { Navigation } from "efi-ui/navigation/navigation";

interface WalletConnectionCardProps {
  chainId: number | undefined;
  account: string | null | undefined;
  active: boolean;
  connectorName: string;
}

export const WalletConnectionCard: FunctionComponent<WalletConnectionCardProps> = ({
  chainId,
  account,
  active,
  connectorName,
}) => {
  const changeTab = useChangeTab();
  return (
    <Card
      className={classNames(tw("flex", "flex-col"))}
      interactive
      style={getCardStyle(chainId)}
      onClick={() => changeTab(Navigation.WALLET)}
    >
      <div
        className={tw("flex", "justify-between", "items-center", "space-x-8")}
      >
        <div className={classNames(tw("flex", "space-x-4", "items-center"))}>
          <WalletJazzicon />

          <div className={tw("flex", "flex-col")}>
            <div className={tw("flex", "items-center", "justify-between")}>
              <span className={classNames(Classes.TEXT_LARGE)}>
                {account ? formatWalletAddress(account) : null}
              </span>
            </div>
            <div className={tw("flex", "items-center", "justify-between")}>
              <span className={classNames(Classes.TEXT_MUTED)}>
                {formatChainName(active, chainId)}
              </span>
            </div>
          </div>
        </div>
        <Tag
          minimal
          large
          icon={<Icon icon={IconNames.DOT} color={Colors.GREEN4} />}
        >
          {connectorName}
        </Tag>
      </div>
    </Card>
  );
};
function getCardStyle(chainId: number | undefined): React.CSSProperties {
  return chainId !== undefined &&
    isMainnet(chainId) &&
    process.env.NODE_ENV !== "production"
    ? { backgroundColor: Colors.RED1 }
    : {};
}
