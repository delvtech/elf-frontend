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

import tw from "elf-tailwindcss-classnames";
import { LabeledText } from "elf-ui/base/LabeledText/LabeledText";
import { findAssetIcon } from "elf-ui/crypto/CryptoIcon";
import { isPrincipalTokenSwapPendingTransaction } from "elf-ui/portfolio/hooks/isPrincipalTokenSwapPendingTransaction";
import { useTokenBalanceOf } from "elf-ui/token/hooks/useTokenBalanceOf";
import { usePendingTransactionPref } from "elf-ui/transactions/usePendingTransactionPref/usePendingTransactionPref";
import { convertEpochSecondsToDate } from "elf/base/convertEpochSecondsToDate";
import { formatAbbreviatedDate } from "elf/base/dates";
import { formatBalance } from "elf/base/formatBalance";
import { getCryptoAssetForToken } from "elf/crypto/getCryptoAssetForToken";
import { getIsMature } from "elf/tranche/getIsMature";
import { trancheContractsByAddress } from "elf/tranche/tranches";
import { useIsTailwindLargeScreen } from "elf-ui/base/mediaBreakpoints";

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
  const isLargeScreen = useIsTailwindLargeScreen();
  return (
    <Card
      className={tw(
        "grid",
        "grid-flow-row",
        "grid-rows-1",
        "lg:grid-flow-col",
        "lg:grid-cols-5",
        "gap-4"
      )}
      onClick={isExpanded ? onExpandClose : onExpandOpen}
    >
      <div className={tw("flex", "space-x-2", "lg:col-span-2")}>
        <LabeledText
          className={tw("text-left", "pl-2")}
          icon={BaseAssetIcon ? <BaseAssetIcon height={36} width={36} /> : null}
          iconClassName={tw("flex-shrink-0")}
          label={symbol}
          text={name}
        />
      </div>
      <span>
        {showSpinner ? (
          <Spinner className={tw("inline-flex")} size={SpinnerSize.SMALL} />
        ) : null}{" "}
        {!isLargeScreen ? t`Balance: ` : null} {balanceLabel}
      </span>
      <span>
        {!isLargeScreen ? t`Matures on: ` : null}
        <Tag
          fill={isLargeScreen}
          intent={isRedeemable ? Intent.SUCCESS : Intent.PRIMARY}
        >
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
