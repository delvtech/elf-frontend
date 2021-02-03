import React, { FC, useCallback, useState } from "react";

import { Card, Classes, Colors, Icon, Tag } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import classNames from "classnames";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { WalletJazzicon } from "efi-ui/wallets/WalletJazzicon/WalletJazzicon";
import { isMainnet } from "efi/crypto/ethereum";
import { formatChainName } from "efi/crypto/formatChainName";
import { formatWalletAddress } from "efi/wallets/formatWalletAddress";

import { Popover2 } from "@blueprintjs/popover2";
import { ConnectWalletButtons } from "efi-ui/wallets/ConnectWalletButtons/ConnectWalletButtons";

interface WalletConnectionCardProps {
  chainId: number | undefined;
  account: string | null | undefined;
  active: boolean;
  connectorName: string | undefined;

  className?: string;
}

export const WalletConnectionCard: FC<WalletConnectionCardProps> = ({
  chainId,
  account,
  active,
  connectorName,
  className,
}) => {
  const { isDarkMode } = useDarkMode();
  const [isWalletDialogOpen, setWalletDialogOpen] = useState(false);
  const openWalletDialog = useCallback(() => setWalletDialogOpen(true), []);
  const closeWalletDialog = useCallback(() => setWalletDialogOpen(false), []);

  const connectionStatusColor = active ? Colors.GREEN4 : Colors.RED4;
  const connectorMessage = connectorName ?? t`No wallet connection`;

  return (
    <Popover2
      minimal
      isOpen={isWalletDialogOpen}
      onClose={closeWalletDialog}
      content={
        <div className={tw("w-400")}>
          <ConnectWalletButtons fill vertical onClick={closeWalletDialog} />
        </div>
      }
    >
      <Card
        className={classNames(tw("h-20", "flex", "items-center"), className)}
        onClick={openWalletDialog}
        style={getCardStyle(chainId, isDarkMode)}
      >
        {!active ? (
          <ConnectToBegin
            isDarkMode={isDarkMode}
            statusColor={connectionStatusColor}
            connectorMessage={connectorMessage}
          />
        ) : (
          <WalletConnectionSummary
            account={account}
            active={active}
            chainId={chainId}
            connectionStatusColor={connectionStatusColor}
            connectorMessage={connectorMessage}
          />
        )}
      </Card>
    </Popover2>
  );
};

interface ConnectToBeginProps {
  isDarkMode: boolean;
  statusColor: string;
  connectorMessage: string;
}

const ConnectToBegin: FC<ConnectToBeginProps> = ({
  isDarkMode,
  statusColor,
  connectorMessage,
}) => {
  return (
    <div className={tw("flex", "flex-1", "items-center", "justify-between")}>
      <button
        className={classNames(
          Classes.BUTTON_TEXT,
          tw("flex-1", "justify-center", "items-center", "flex", "mr-5")
        )}
        style={{ color: isDarkMode ? Colors.BLUE5 : Colors.BLUE2 }}
      >
        {t`Connect wallet to begin`}
      </button>
      <Tag
        minimal
        large
        icon={<Icon icon={IconNames.DOT} color={statusColor} />}
      >
        {connectorMessage}
      </Tag>
    </div>
  );
};

interface WalletSummaryProps {
  account: string | null | undefined;
  active: boolean;
  chainId: number | undefined;
  connectionStatusColor: string;
  connectorMessage: string;
}

const WalletConnectionSummary: FC<WalletSummaryProps> = ({
  account,
  active,
  chainId,
  connectionStatusColor,
  connectorMessage,
}) => {
  return (
    <div
      className={tw(
        "flex",
        "w-full",
        "items-center",
        "space-x-10",
        "justify-between"
      )}
    >
      <div className={classNames(tw("flex", "space-x-4", "items-center"))}>
        <WalletJazzicon />

        <button className={Classes.BUTTON_TEXT}>
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
        </button>
      </div>
      <Tag
        minimal
        large
        icon={<Icon icon={IconNames.DOT} color={connectionStatusColor} />}
      >
        {connectorMessage}
      </Tag>
    </div>
  );
};

function getCardStyle(
  chainId: number | undefined,
  isDarkMode: boolean
): React.CSSProperties {
  const mainnetDanger =
    chainId && isMainnet(chainId) && process.env.NODE_ENV !== "production";

  if (mainnetDanger) {
    return { backgroundColor: isDarkMode ? Colors.RED1 : Colors.ORANGE5 };
  }

  return {};
}
