import React, { ReactElement } from "react";

import { Card, Classes } from "@blueprintjs/core";
import classNames from "classnames";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { TimeLeft } from "efi-ui/base/TimeLeft/TimeLeft";
import { useYearnVault } from "efi-ui/yearn/useYearnVault";
import { formatPercent } from "efi/base/formatPercent";
import { ERC20 } from "elf-contracts/types/ERC20";
import { useTokenSymbol } from "efi-ui/token/hooks/useTokenSymbol";

interface VaultSummaryProps {
  maturityDate: number | undefined;
  startDate: number | undefined;
  baseAsset: ERC20 | undefined;
}

// TODO: add loading states
export function VaultSummary(props: VaultSummaryProps): ReactElement {
  const { baseAsset, maturityDate = 0, startDate = 0 } = props;
  const maturityDateString = new Date(maturityDate).toLocaleDateString();
  // hardcode for now, will make this dynamic after updating testnet
  const { data: baseAssetSymbol } = useTokenSymbol(baseAsset);
  const { data: vaultInfo } = useYearnVault(
    baseAssetSymbol ? t`yv${baseAssetSymbol}` : undefined
  );
  const { name, type } = vaultInfo || {};
  const apy = vaultInfo?.apy?.recommended;

  return (
    <div className={tw("flex-1")}>
      <div className="mb-2">{t`Vault and Term Summary`}</div>
      <Card>
        <div className={tw("flex", "flex-col", "space-y-6")}>
          <div className={tw("flex", "space-x-4", "justify-between")}>
            <div className={tw("flex", "flex-col")}>
              <span
                className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}
              >{t`Vault Name`}</span>
              <div className={classNames("h3", tw("space-x-4"))}>
                {name} {type}
              </div>
            </div>
          </div>
          {/* Volume (24hr)*/}
          <div className={tw("flex", "space-x-4", "justify-between")}>
            <div className={tw("flex", "flex-col")}>
              <span
                className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}
              >{t`Vault ROI (annual)`}</span>
              <div className={classNames("h3", tw("space-x-4"))}>
                {apy ? formatPercent(apy) : undefined}
              </div>
            </div>
          </div>
          <div className={tw("flex", "space-x-4", "justify-between")}>
            <div className={tw("flex", "flex-col")}>
              <span
                className={classNames(Classes.TEXT_MUTED, tw("text-sm"))}
              >{t`Term date`}</span>
              <div className={classNames("h3", tw("space-x-4", "flex"))}>
                {maturityDateString}
              </div>
            </div>
            <div className={tw("flex", "self-end")}>
              <TimeLeft startDate={startDate} maturityDate={maturityDate} />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
