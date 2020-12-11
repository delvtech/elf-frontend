import React, { FC } from "react";

import { Card } from "@blueprintjs/core";
import { RouteComponentProps } from "@reach/router";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";

interface WalletViewProps extends RouteComponentProps {}
export const WalletView: FC<WalletViewProps> = () => {
  return (
    <div
      className={tw(
        "flex",
        "h-full",
        "w-full",
        "justify-center",
        "items-center"
      )}
    >
      <Card>{t`Wwallet view here`}</Card>
    </div>
  );
};
