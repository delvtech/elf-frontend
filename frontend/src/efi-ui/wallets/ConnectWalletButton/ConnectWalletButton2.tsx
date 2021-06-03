import { ReactElement, useCallback, useState } from "react";

import { Button, Colors, Icon, Intent } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { WalletJazzicon } from "efi-ui/wallets/WalletJazzicon/WalletJazzicon";
import { ChainId, isMainnet } from "efi/ethereum";
import { formatWalletAddress } from "efi/wallets/formatWalletAddress";
import { ConnectWalletDialog } from "efi-ui/wallets/ConnectWalletDialog/ConnectWalletDialog";

interface ConnectWalletButton2Props {
  account: string | null | undefined;
  walletConnectionActive: boolean | undefined;
  chainId: number | undefined;
}

const ChainColor: Record<number, string> = {
  [ChainId.GOERLI]: Colors.BLUE4,
  [ChainId.MAINNET]: Colors.GREEN4,
  [ChainId.LOCAL]: Colors.WHITE,
};
export function ConnectWalletButton2(
  props: ConnectWalletButton2Props
): ReactElement {
  const { account, chainId, walletConnectionActive } = props;
  const [isWalletDialogOpen, setWalletDialogOpen] = useState(false);
  const onCloseWalletDialog = useCallback(() => setWalletDialogOpen(false), []);
  const onOpenWalletDialog = useCallback(() => setWalletDialogOpen(true), []);

  const mainnetDanger =
    !!chainId && isMainnet(chainId) && process.env.NODE_ENV !== "production";

  let walletButtonIntent: Intent = Intent.NONE;
  if (!account) {
    walletButtonIntent = Intent.WARNING;
  } else if (mainnetDanger) {
    walletButtonIntent = Intent.DANGER;
  }
  const connectionStatusColor =
    walletConnectionActive && !!chainId ? ChainColor[chainId] : Colors.RED4;

  return (
    <div className={tw("flex", "space-x-8", "items-center")}>
      {!account ? (
        <div>
          <Button
            outlined
            fill
            large
            intent={walletButtonIntent}
            onClick={onOpenWalletDialog}
          >
            <span className={tw("text-center")}>
              {t`Connect wallet to begin`}
            </span>
          </Button>
        </div>
      ) : (
        <div>
          <Button
            minimal={!mainnetDanger}
            icon={<WalletJazzicon size={28} account={account} />}
            rightIcon={
              <Icon
                className={tw("pr-2")}
                icon={IconNames.DOT}
                color={connectionStatusColor}
              />
            }
            fill
            large
            intent={walletButtonIntent}
            onClick={onOpenWalletDialog}
          >
            {formatWalletAddress(account)}
          </Button>
        </div>
      )}
      <ConnectWalletDialog
        isOpen={isWalletDialogOpen}
        onClose={onCloseWalletDialog}
      />
    </div>
  );
}
