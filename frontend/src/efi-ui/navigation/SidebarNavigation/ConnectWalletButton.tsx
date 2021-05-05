import React, { ReactElement } from "react";

import { Button, Colors, Icon, Intent } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { ConnectWalletDialog } from "efi-ui/wallets/ConnectWalletDialog/ConnectWalletDialog";
import { WalletJazzicon } from "efi-ui/wallets/WalletJazzicon/WalletJazzicon";
import { ChainId, isMainnet } from "efi/ethereum";
import { formatChainName } from "efi/crypto/formatChainName";
import { formatWalletAddress } from "efi/wallets/formatWalletAddress";

interface ConnectWalletButtonProps {
  isDialogOpen: boolean;
  onDialogOpen: () => void;
  onDialogClose: () => void;
  account: string | null | undefined;
  active: boolean;
  chainId: number | undefined;
}
const ChainColor: Record<number, string> = {
  [ChainId.GOERLI]: Colors.BLUE4,
  [ChainId.MAINNET]: Colors.GREEN4,
  [ChainId.LOCAL]: Colors.WHITE,
};
export function ConnectWalletButton({
  chainId,
  account,
  active,
  isDialogOpen,
  onDialogOpen,
  onDialogClose,
}: ConnectWalletButtonProps): ReactElement {
  const mainnetDanger =
    !!chainId && isMainnet(chainId) && process.env.NODE_ENV !== "production";

  let walletButtonIntent: Intent = Intent.NONE;
  if (!account) {
    walletButtonIntent = Intent.WARNING;
  } else if (mainnetDanger) {
    walletButtonIntent = Intent.DANGER;
  }
  const connectionStatusColor =
    active && !!chainId ? ChainColor[chainId] : Colors.RED4;

  return (
    <Button
      minimal={!mainnetDanger}
      fill
      intent={walletButtonIntent}
      onClick={onDialogOpen}
    >
      <div
        className={tw(
          "flex",
          "flex-col",
          "space-y-4",
          "items-center",
          "px-6",
          "py-2"
        )}
      >
        {!account ? (
          <Icon icon={IconNames.SEND_TO_GRAPH} iconSize={Icon.SIZE_LARGE} />
        ) : (
          <WalletJazzicon size={42} account={account} />
        )}
        {!account ? (
          <span className={tw("text-center")}>
            {t`Connect wallet to begin`}
          </span>
        ) : (
          <LabeledText
            className={tw("text-center")}
            text={
              <span>
                <Icon
                  className={tw("pr-2")}
                  icon={IconNames.DOT}
                  color={connectionStatusColor}
                />
                {formatWalletAddress(account)}
              </span>
            }
            label={formatChainName(active, chainId)}
          />
        )}
      </div>
      <ConnectWalletDialog isOpen={isDialogOpen} onClose={onDialogClose} />
    </Button>
  );
}
