import React, { FC } from "react";

import { Callout, H4, Intent } from "@blueprintjs/core";
import { jt, t } from "ttag";

import tw from "efi-tailwindcss-classnames";

interface NoWalletConnectedCalloutProps {}

export const NoWalletConnectedCallout: FC<NoWalletConnectedCalloutProps> = () => {
  const connectYourWalletLink = (
    <a key="connect-your-wallet-link" href="/">{t`connect your wallet`}</a>
  );
  return (
    <Callout intent={Intent.PRIMARY} icon={null}>
      <div className={tw("p-6")}>
        <H4>{t`More information is available when you connect your wallet`}</H4>
        <span>{jt`Don't worry, you can still explore the minting process, but we'll show your balances and other relevant info when you ${connectYourWalletLink}.`}</span>
      </div>
    </Callout>
  );
};
