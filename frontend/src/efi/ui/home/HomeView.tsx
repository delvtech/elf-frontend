import React, { FC } from "react";

import { Card } from "@blueprintjs/core";
import { RouteComponentProps } from "@reach/router";
import tw from "efi-tailwindcss-classnames";
import { t } from "ttag";

interface HomeViewProps extends RouteComponentProps {}
export const HomeView: FC<HomeViewProps> = () => {
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
      <Card>{t`Welcome to Element Finance`}</Card>
    </div>
  );
};
