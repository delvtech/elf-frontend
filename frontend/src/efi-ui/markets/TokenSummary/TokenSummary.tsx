import React, { FC } from "react";

import { Card, Classes, Icon, Intent, Tag } from "@blueprintjs/core";
import classNames from "classnames";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { getQueryData } from "efi-ui/base/queryResults";
import { ERC20 } from "elf-contracts/types/ERC20";

interface TokenSummaryProps {
  tokenIn: ERC20 | undefined;
  tokenOut: ERC20 | undefined;
}

export const TokenSummary: FC<TokenSummaryProps> = ({ tokenIn, tokenOut }) => {
  const tokenInNameResult = useSmartContractReadCall(tokenIn, "name");
  const tokenOutNameResult = useSmartContractReadCall(tokenOut, "name");
  return (
    <div className={tw("flex-1")}>
      <div className="mb-2">{t`Tokens`}</div>
      <div className={tw("flex", "flex-col", "space-x-4")}>
        <Card className={tw("flex", "space-x-8")}>
          <div className={tw("space-y-6", "flex-1")}>
            <div
              className={tw("flex", "flex-col", "justify-center", "space-y-1")}
            >
              <span className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}>
                {t`Token`}
              </span>
              <span className={tw("text-lg")}>
                {getQueryData(tokenInNameResult)}
              </span>
            </div>
            <div
              className={tw("flex", "flex-col", "justify-center", "space-y-1")}
            >
              <span className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}>
                {t`Price`}
              </span>
              <div className={tw("flex", "justify-between")}>
                <span className={tw("text-lg")}>{"$1,234"}</span>
                <Tag minimal intent={Intent.SUCCESS}>
                  .16%
                  <Icon icon={"caret-up"} />
                </Tag>
              </div>
            </div>
            <div
              className={tw("flex", "flex-col", "justify-center", "space-y-1")}
            >
              <span className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}>
                {t`Quantity`}
              </span>
              <div className={tw("flex", "justify-between")}>
                <span className={tw("text-lg")}>{"61,334"}</span>
                <Tag minimal intent={Intent.SUCCESS}>
                  .16%
                  <Icon icon={"caret-up"} />
                </Tag>
              </div>
            </div>
          </div>
          <div className={tw("space-y-6", "flex-1")}>
            <div
              className={tw("flex", "flex-col", "justify-center", "space-y-1")}
            >
              <span className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}>
                {t`Token`}
              </span>
              <span className={tw("text-lg")}>
                {getQueryData(tokenOutNameResult)}
              </span>
            </div>
            <div
              className={tw("flex", "flex-col", "justify-center", "space-y-1")}
            >
              <span className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}>
                {t`Price`}
              </span>
              <div className={tw("flex", "justify-between")}>
                <span className={tw("text-lg")}>{"$1,234"}</span>
                <Tag minimal intent={Intent.SUCCESS}>
                  .16%
                  <Icon icon={"caret-up"} />
                </Tag>
              </div>
            </div>
            <div
              className={tw("flex", "flex-col", "justify-center", "space-y-1")}
            >
              <span className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}>
                {t`Quantity`}
              </span>
              <div className={tw("flex", "justify-between")}>
                <span className={tw("text-lg")}>{"61,334"}</span>
                <Tag minimal intent={Intent.SUCCESS}>
                  .16%
                  <Icon icon={"caret-up"} />
                </Tag>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
