import React, { ReactElement } from "react";

import {
  Button,
  ButtonGroup,
  Card,
  Elevation,
  Intent,
  Tag,
} from "@blueprintjs/core";
import { PrincipalTokenInfo } from "tokenlists/types";
import { t } from "ttag";

import { convertEpochSecondsToDate2 } from "efi/base/convertEpochSecondsToDate";
import { formatAbbreviatedDate } from "efi/base/dates";
import tw from "efi-tailwindcss-classnames";
import { getIsMature2 } from "efi/tranche/getIsMature";
import { useTokenBalanceOf } from "efi-ui/token/hooks/useTokenBalanceOf";
import { trancheContractsByAddress } from "efi/tranche/tranches";
import { formatBalance } from "efi/base/formatBalance";
import { getCryptoAssetForToken } from "efi/crypto/getCryptoAssetForToken";
import { findAssetIcon2 } from "efi-ui/crypto/CryptoIcon";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { isDust } from "efi/coins/isDust";

interface SaveBalanceCardProps {
  account: string | null | undefined;
  principalToken: PrincipalTokenInfo;
}

export function SaveBalanceCard(
  props: SaveBalanceCardProps
): ReactElement | null {
  const {
    account,
    principalToken: {
      address,
      decimals,
      symbol,
      name,
      extensions: { unlockTimestamp, underlying },
    },
  } = props;
  const tranche = trancheContractsByAddress[address];
  const { data: balanceOf, isLoading } = useTokenBalanceOf(tranche, account);
  if (
    isLoading ||
    (balanceOf && isDust(balanceOf, decimals)) ||
    balanceOf?.isZero()
  ) {
    return null;
  }

  const baseAsset = getCryptoAssetForToken(underlying);
  const BaseAssetIcon = findAssetIcon2(baseAsset);
  const balanceLabel = formatBalance(balanceOf, decimals);
  const unlockDate = convertEpochSecondsToDate2(unlockTimestamp);
  const formattedUnlockDate = formatAbbreviatedDate(unlockDate);
  const isRedeemable = getIsMature2(unlockTimestamp);
  return (
    <Card
      elevation={Elevation.TWO}
      className={tw("grid", "grid-cols-6", "gap-4")}
    >
      <div className={tw("flex", "space-x-2", "col-span-2")}>
        <LabeledText
          className={tw("text-left", "pl-2")}
          icon={BaseAssetIcon ? <BaseAssetIcon height={36} width={36} /> : null}
          label={symbol}
          text={name}
        />
      </div>
      <span>{balanceLabel}</span>
      <span>
        <Tag minimal intent={isRedeemable ? Intent.SUCCESS : Intent.PRIMARY}>
          {formattedUnlockDate}
        </Tag>
      </span>
      <div className={tw("col-span-2", "justify-end")}>
        <ButtonGroup>
          <Button outlined>{t`Sell`}</Button>
          <Button outlined>{t`Buy`}</Button>
          <Button outlined disabled={!isRedeemable}>{t`Redeem`}</Button>
        </ButtonGroup>
      </div>
    </Card>
  );
}
