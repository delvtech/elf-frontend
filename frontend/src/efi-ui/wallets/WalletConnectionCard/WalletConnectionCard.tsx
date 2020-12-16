import {
  Card,
  Classes,
  Colors,
  Dialog,
  Elevation,
  Icon,
  Tag,
} from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import classNames from "classnames";
import React, {
  Fragment,
  FunctionComponent,
  useCallback,
  useState,
} from "react";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { WalletJazzicon } from "efi-ui/wallets/WalletJazzicon/WalletJazzicon";
import { isMainnet } from "efi/crypto/ethereum";
import { formatChainName } from "efi/crypto/formatChainName";
import { formatWalletAddress } from "efi/wallets/formatWalletAddress";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { ConnectWalletButtons } from "efi-ui/wallets/ConnectWalletButtons/ConnectWalletButtons";

interface WalletConnectionCardProps {
  chainId: number | undefined;
  account: string | null | undefined;
  active: boolean;
  connectorName: string | undefined;
}

export const WalletConnectionCard: FunctionComponent<WalletConnectionCardProps> = ({
  chainId,
  account,
  active,
  connectorName,
}) => {
  const { isDarkMode, darkModeClassName } = useDarkMode();
  const [isWalletDialogOpen, setWalletDialogOpen] = useState(false);
  const openWalletDialog = useCallback(() => setWalletDialogOpen(true), []);
  const closeWalletDialog = useCallback(() => setWalletDialogOpen(false), []);

  const connectionStatusColor = active ? Colors.GREEN4 : Colors.RED4;
  const connectorMessage = connectorName ?? t`No wallet connection`;

  return (
    <Fragment>
      <Card
        className={classNames(tw("flex", "h-24"))}
        interactive
        elevation={!active ? Elevation.TWO : undefined}
        onClick={openWalletDialog}
        style={getCardStyle(chainId)}
      >
        {!active ? (
          <div
            className={tw("flex", "flex-1", "items-center", "justify-between")}
          >
            {/* button for a11y, this allows users to TAB through our UI */}
            <button
              className={classNames(Classes.BUTTON_TEXT, Classes.TEXT_LARGE)}
              style={{ color: isDarkMode ? Colors.BLUE5 : Colors.BLUE2 }}
            >
              {t`Connect wallet to begin`}
            </button>
            <Tag
              minimal
              large
              icon={<Icon icon={IconNames.DOT} color={connectionStatusColor} />}
            >
              {connectorMessage}
            </Tag>
          </div>
        ) : (
          <div
            className={tw(
              "flex",
              "w-full",
              "items-center",
              "space-x-8",
              "justify-between"
            )}
          >
            <div
              className={classNames(tw("flex", "space-x-4", "items-center"))}
            >
              <WalletJazzicon />

              {/* button for a11y, this allows users to TAB through our UI */}
              <button className={Classes.BUTTON_TEXT}>
                <div className={tw("flex", "flex-col")}>
                  <div
                    className={tw("flex", "items-center", "justify-between")}
                  >
                    <span className={classNames(Classes.TEXT_LARGE)}>
                      {account ? formatWalletAddress(account) : null}
                    </span>
                  </div>
                  <div
                    className={tw("flex", "items-center", "justify-between")}
                  >
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
        )}
      </Card>
      <Dialog
        className={classNames(darkModeClassName, tw("pb-0"))}
        isOpen={isWalletDialogOpen}
        icon={IconNames.SEND_TO_GRAPH}
        title={t`Connect a wallet`}
        onClose={() => setWalletDialogOpen(false)}
      >
        <div className={tw("flex", "w-full", "h-full", "p-12")}>
          <ConnectWalletButtons onClick={closeWalletDialog} />
        </div>
      </Dialog>
    </Fragment>
  );
};
function getCardStyle(chainId: number | undefined): React.CSSProperties {
  return chainId !== undefined &&
    isMainnet(chainId) &&
    process.env.NODE_ENV !== "production"
    ? { backgroundColor: Colors.RED1 }
    : {};
}
