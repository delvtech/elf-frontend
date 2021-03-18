import React, { FC } from "react";
import { Callout, Intent } from "@blueprintjs/core";
import { t } from "ttag";
import tw from "efi-tailwindcss-classnames";

interface WalletApprovalCalloutProps {
  baseAssetSymbol: string | undefined;
}
export const WalletApprovalCallout: FC<WalletApprovalCalloutProps> = ({
  baseAssetSymbol,
}) => {
  return (
    <Callout
      intent={Intent.WARNING}
      title={t`Wallet approval required`}
      icon={null}
      className={tw("p-4")}
    >
      <div
        className={"pt-1"}
      >{t`Element uses Balancer Pools for trading. You'll need to grant Balancer approval to spend your ${baseAssetSymbol} in order to swap for FYTs.`}</div>
    </Callout>
  );
};
