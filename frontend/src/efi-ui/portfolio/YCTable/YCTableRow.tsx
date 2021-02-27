import React, { FC, ReactNode } from "react";

import { AnchorButton, Button, Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Tooltip2 } from "@blueprintjs/popover2";
import classNames from "classnames";
import {
  Elf__factory,
  ERC20__factory,
  Tranche__factory,
  YC,
} from "elf-contracts/types";
import { jt, t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import styles from "efi-ui/base/table.module.css";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { useTokenBalance } from "efi-ui/token/hooks/useTokenBalance";
import { useSmartContractFromFactory } from "efi-ui/contracts/useSmartContractFromFactory/useSmartContractFromFactory";
import { convertEpochSecondsToDate } from "efi/base/convertEpochSecondsToDate";
import { formatAbbreviatedDate } from "efi/base/dates";
import { getTimeLeft2 } from "efi/base/time";
import { getQueryData } from "efi-ui/base/queryResults";

interface YCTableRowProps {
  account: string | null | undefined;
  yieldCoupon: YC;
}

export const YCTableRow: FC<YCTableRowProps> = ({ account, yieldCoupon }) => {
  const { isDarkMode } = useDarkMode();

  const tableRowClassName = isDarkMode ? styles.tableRowDark : styles.tableRow;

  const { data: ycSymbol } = useSmartContractReadCall(yieldCoupon, "symbol");
  const ycBalance = useTokenBalance(yieldCoupon, account);

  // The tranche contains the unlockTimestamp
  const { data: trancheAddress } = useSmartContractReadCall(
    yieldCoupon,
    "tranche"
  );
  const tranche = useSmartContractFromFactory(
    trancheAddress,
    Tranche__factory.connect
  );
  const elfAddressResult = useSmartContractReadCall(tranche, "elf");
  const elfContract = useSmartContractFromFactory(
    getQueryData(elfAddressResult),
    Elf__factory.connect
  );
  const vaultAddressResult = useSmartContractReadCall(elfContract, "vault");
  const vaultContract = useSmartContractFromFactory(
    getQueryData(vaultAddressResult),
    ERC20__factory.connect
  );
  const { data: vaultName } = useSmartContractReadCall(vaultContract, "name");
  const { data: unlockTimestamp } = useSmartContractReadCall(
    tranche,
    "unlockTimestamp"
  );
  const maturationDate = convertEpochSecondsToDate(unlockTimestamp);
  const timeLeft = getTimeLeft2(maturationDate);

  const tableRowLink = getTableRowLink(vaultContract?.address, vaultName);

  return (
    <div
      className={classNames(
        tableRowClassName,
        tw("grid", "grid-cols-8", "w-full", "gap-2", "p-4")
      )}
    >
      {/* Asset */}
      <div>
        <LabeledText text={ycSymbol} label={jt`via ${tableRowLink}`} />
      </div>
      {/* Quantity */}
      <div>
        <LabeledText text={ycBalance.toFixed(6)} label="" />
      </div>

      {/* Current exit value */}
      <div>
        <LabeledText text={t`8.01893 ETH`} label={t`8,105.23 USD`} />
      </div>

      {/* Current acc. value */}
      <div>
        <LabeledText text={t`1.013 ETH`} label={t`1,105.23 USD`} />
      </div>

      {/* Yield rate YC */}
      <div>
        <LabeledText
          text={t`0.32% daily`}
          label={t`4.21% monthly`}
          subLabel={t`12.21% yearly`}
        />
      </div>

      {/* Yield rate Underlying */}
      <div>
        <LabeledText
          text={t`0.32% daily`}
          label={t`4.21% monthly`}
          subLabel={t`12.21% yearly`}
        />
      </div>

      {/* Maturation date */}
      <div>
        <LabeledText
          text={maturationDate && formatAbbreviatedDate(maturationDate)}
          label={t`in ${timeLeft}`}
        />
      </div>

      {/* Quick Actions */}
      <div className={tw("flex", "flex-col", "h-full", "w-full", "space-y-2")}>
        <Button outlined>{t`Sell`}</Button>
        <Button outlined>{t`Stake`}</Button>
        <Tooltip2
          inheritDarkTheme={false}
          content={t`This asset can be claimed after it has reached maturity.`}
        >
          <AnchorButton
            fill
            outlined
            disabled={
              /*
               * See Blueprint docs, we have to use an AnchorButton for a11y
               * when putting a tooltip on a disabled button
               */
              true
            }
          >
            {t`Claim`}
          </AnchorButton>
        </Tooltip2>
        <Button outlined>{t`Go to market`}</Button>
      </div>
    </div>
  );
};

function getTableRowLink(
  vaultAddress: string | undefined,
  vaultName: string | undefined
): ReactNode {
  if (!vaultAddress || !vaultName) {
    return null;
  }

  return (
    <a key="table-row-link" href={`https://etherscan.io/token/${vaultAddress}`}>
      {vaultName}{" "}
      <sup>
        <Icon icon={IconNames.SHARE} iconSize={8} />
      </sup>
    </a>
  );
}
