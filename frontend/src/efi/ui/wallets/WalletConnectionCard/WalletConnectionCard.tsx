import { Card, Classes } from "@blueprintjs/core";
import classNames from "classnames";
import React, { FunctionComponent } from "react";

import tw from "efi-tailwindcss-classnames";
import { formatChainName } from "efi/ui/crypto/formatChainName";
import { formatWalletAddress } from "efi/wallets/formatWalletAddress";

interface WalletConnectionCardProps {
  chainId: number | undefined;
  account: string | null | undefined;
  active: boolean;
}

export const WalletConnectionCard: FunctionComponent<WalletConnectionCardProps> = ({
  chainId,
  account,
  active,
}) => {
  return (
    <Card className={classNames(tw("flex", "flex-col"))} interactive>
      <div
        className={tw("flex", "justify-between", "items-center", "space-x-8")}
      >
        <div className={classNames(tw("flex", "space-x-4", "items-center"))}>
          {/* TODO: use a Blockies or jazzicon here */}
          <div
            style={{
              height: 48,
              width: 48,
              borderRadius: "50%",
              borderColor: "white",
              borderWidth: 1,
              backgroundColor: "black",
              flexShrink: 0,
            }}
          />

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
      </div>
    </Card>
  );
};
