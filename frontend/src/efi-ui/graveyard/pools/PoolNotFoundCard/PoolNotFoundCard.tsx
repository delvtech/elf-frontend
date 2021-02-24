import { Card, NonIdealState } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Link } from "@reach/router";
import classNames from "classnames";
import React, { FC } from "react";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { Navigation } from "efi-ui/navigation/navigation";

interface PoolNotFoundCardProps {}

export const PoolNotFoundCard: FC<PoolNotFoundCardProps> = () => {
  return (
    <Card>
      <NonIdealState
        icon={IconNames.HELP}
        title={t`Pool not found.`}
        className={tw("max-w-full")}
        description={
          <div
            className={classNames(
              tw(
                "md:text-left",
                "flex",
                "flex-col",
                "justify-center",
                "items-center",
                "gap-y-5"
              )
            )}
          >
            <span>{t`This could happen for several reasons:`}</span>
            <ul className={tw("w-9/12", "list-disc", "text-left")}>
              <li className={tw("mb-3")}>
                {t`The address of the pool contract is not correct.`}
              </li>
              <li>{t`We no longer support this pool.`}</li>
            </ul>
          </div>
        }
        action={
          <Link
            to={`/${Navigation.POOLS}`}
          >{t`Click here to browse our pools.`}</Link>
        }
      ></NonIdealState>
    </Card>
  );
};
