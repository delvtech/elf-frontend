import { ReactElement, useState } from "react";

import { Button, Card, Collapse, Intent, Tag } from "@blueprintjs/core";
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
import { SaveTransactionsCard } from "./SaveTransactionsCard";
import { SaveTransactionTabId } from "./SaveTransactionTabId";
import { Web3Provider } from "@ethersproject/providers";

interface SaveBalanceCardProps {
  library: Web3Provider | undefined;
  account: string | null | undefined;
  principalToken: PrincipalTokenInfo;
  isExpanded: boolean;
  onExpandOpen: () => void;
  onExpandClose: () => void;
}

export function SaveBalanceCard(
  props: SaveBalanceCardProps
): ReactElement | null {
  const {
    library,
    account,
    isExpanded,
    onExpandOpen,
    onExpandClose,
    principalToken,
    principalToken: {
      address,
      decimals,
      symbol,
      name,
      extensions: { unlockTimestamp, underlying },
    },
  } = props;

  const [activeTabId, setActiveTabId] = useState<SaveTransactionTabId>(
    SaveTransactionTabId.BUY
  );

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
    <Card interactive className={tw("p-0")}>
      <Card
        className={tw("grid", "grid-cols-5", "gap-4")}
        onClick={isExpanded ? onExpandClose : onExpandOpen}
      >
        <div className={tw("flex", "space-x-2", "col-span-2")}>
          <LabeledText
            className={tw("text-left", "pl-2")}
            icon={
              BaseAssetIcon ? <BaseAssetIcon height={36} width={36} /> : null
            }
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
      <Collapse isOpen={isExpanded}>
        <SaveTransactionsCard
          library={library}
          account={account}
          principalToken={principalToken}
          activeTabId={activeTabId}
          setActiveTabId={setActiveTabId}
        />
      </Collapse>
    </Card>
  );
}
