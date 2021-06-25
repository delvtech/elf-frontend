import { ReactElement } from "react";

import {
  Button,
  Card,
  Intent,
  Spinner,
  SpinnerSize,
  Tag,
} from "@blueprintjs/core";
import { PrincipalTokenInfo } from "tokenlists/types";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { findAssetIcon } from "efi-ui/crypto/CryptoIcon";
import { isPrincipalTokenSwapPendingTransaction } from "efi-ui/portfolio/hooks/isPrincipalTokenSwapPendingTransaction";
import { useTokenBalanceOf } from "efi-ui/token/hooks/useTokenBalanceOf";
import { usePendingTransactionPref } from "efi-ui/transactions/usePendingTransactionPref/usePendingTransactionPref";
import { convertEpochSecondsToDate } from "efi/base/convertEpochSecondsToDate";
import { formatAbbreviatedDate } from "efi/base/dates";
import { formatBalance } from "efi/base/formatBalance";
import { getCryptoAssetForToken } from "efi/crypto/getCryptoAssetForToken";
import { getIsMature } from "efi/tranche/getIsMature";
import { trancheContractsByAddress } from "efi/tranche/tranches";

interface PrincipalTokenSummaryCardProps {
  account: string | null | undefined;
  principalToken: PrincipalTokenInfo;
  isExpanded: boolean;
  onExpandClose: () => void;
  onExpandOpen: () => void;
}

export function PrincipalTokenSummaryCard(
  props: PrincipalTokenSummaryCardProps
): ReactElement {
  const {
    account,
    isExpanded,
    onExpandOpen,
    onExpandClose,
    principalToken: {
      address,
      decimals,
      symbol,
      name,
      extensions: { unlockTimestamp, underlying },
    },
  } = props;
  const tranche = trancheContractsByAddress[address];
  const { data: balanceOf } = useTokenBalanceOf(tranche, account);
  const baseAsset = getCryptoAssetForToken(underlying);
  const BaseAssetIcon = findAssetIcon(baseAsset);
  const balanceLabel = formatBalance(balanceOf, decimals);
  const unlockDate = convertEpochSecondsToDate(unlockTimestamp);
  const formattedUnlockDate = formatAbbreviatedDate(unlockDate);
  const isRedeemable = getIsMature(unlockTimestamp);

  // spinner
  const pendingTxPref = usePendingTransactionPref();
  const showSpinner = isPrincipalTokenSwapPendingTransaction(
    pendingTxPref,
    address
  );

  return (
    <Card
      className={tw("grid", "grid-cols-5", "gap-4")}
      onClick={isExpanded ? onExpandClose : onExpandOpen}
    >
      <div className={tw("flex", "space-x-2", "col-span-2")}>
        <LabeledText
          className={tw("text-left", "pl-2")}
          icon={BaseAssetIcon ? <BaseAssetIcon height={36} width={36} /> : null}
          label={symbol}
          text={name}
        />
      </div>
      <span>
        {showSpinner ? (
          <Spinner className={tw("inline-flex")} size={SpinnerSize.SMALL} />
        ) : null}{" "}
        {balanceLabel}
      </span>
      <span>
        <Tag fill intent={isRedeemable ? Intent.SUCCESS : Intent.PRIMARY}>
          {formattedUnlockDate}
        </Tag>
      </span>
      <div className={tw("justify-end")}>
        <Button
          fill
          minimal
          intent={Intent.PRIMARY}
          active={isExpanded}
          onClick={isExpanded ? onExpandClose : onExpandOpen}
        >
          {isExpanded ? t`Hide` : t`Show`}
        </Button>
      </div>
    </Card>
  );
}
