import React, { Fragment, ReactElement, useCallback, useState } from "react";

import { AnchorButton, Button, Intent } from "@blueprintjs/core";
import { Tooltip2 } from "@blueprintjs/popover2";
import { Web3Provider } from "@ethersproject/providers";
import { formatUnits } from "ethers/lib/utils";
import {
  PrincipalTokenInfo as TrancheInfo,
  YieldTokenInfo,
} from "@elementfi/tokenlist";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { useNowMs } from "efi-ui/base/hooks/useNowMs/useNowMs";
import { useTokenAllowance } from "efi-ui/token/hooks/useTokenAllowance";
import { RedeemYieldTokensDrawer } from "efi-ui/tranche/RedeemTokensDrawer/RedeemYieldTokensDrawer";
import { useTrancheCanPerform } from "efi-ui/tranche/useTrancheCanPerform";
import ContractAddresses from "efi/addresses/addresses";
import { convertEpochSecondsToDate } from "efi/base/convertEpochSecondsToDate/convertEpochSecondsToDate";
import { CryptoAsset } from "efi/crypto/CryptoAsset";
import { interestTokenContractsByAddress } from "efi/interestToken/interestToken";
import { getTokenInfo } from "efi/tokenlists/tokenlists";

interface RedeemYieldTokensButtonOldProps {
  account: string | null | undefined;
  library: Web3Provider | undefined;

  yieldTokenInfo: YieldTokenInfo;
  baseAsset: CryptoAsset;
}

const { userProxyContractAddress } = ContractAddresses;
export function RedeemYieldTokensButtonOld({
  baseAsset,
  yieldTokenInfo,
  account,
  library,
}: RedeemYieldTokensButtonOldProps): ReactElement {
  const nowMs = useNowMs();
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const trancheInfo = getTokenInfo<TrancheInfo>(
    yieldTokenInfo.extensions.tranche
  );
  const {
    address,
    extensions: { unlockTimestamp },
  } = trancheInfo;

  const canPerformWithdrawInterest = useTrancheCanPerform(
    address,
    "withdrawInterest"
  );
  const unlockDate = convertEpochSecondsToDate(unlockTimestamp);
  const buttonDisabled =
    (unlockDate && unlockDate.getTime() > nowMs) || !canPerformWithdrawInterest;

  const yieldTokenContract =
    interestTokenContractsByAddress[yieldTokenInfo.address];
  const { data: userProxyAllowanceBN } = useTokenAllowance(
    yieldTokenContract,
    account,
    userProxyContractAddress
  );

  const userProxyAllowance = formatUnits(
    userProxyAllowanceBN ?? 1,
    yieldTokenInfo.decimals
  );

  const openDrawer = useCallback(() => {
    setDrawerOpen(true);
  }, []);

  if (!canPerformWithdrawInterest) {
    return (
      <Tooltip2
        inheritDarkTheme={false}
        className={tw("w-full")}
        intent={Intent.DANGER}
        content={t`Redeeming for this token has been temporarily disabled, please refer to our Discord or Twitter for further updates.`}
      >
        <AnchorButton
          fill
          intent={Intent.DANGER}
          minimal
          disabled={
            /*
             * See Blueprint docs, we have to use an AnchorButton for a11y
             * when putting a tooltip on a disabled button
             */
            true
          }
        >
          <div className={tw("p-2", "text-base")}>{t`Redeem`}</div>
        </AnchorButton>
      </Tooltip2>
    );
  }

  return (
    <Fragment>
      {buttonDisabled ? (
        <Tooltip2
          inheritDarkTheme={false}
          className={tw("w-full")}
          content={t`This asset can be claimed after it has reached maturity.`}
        >
          <AnchorButton
            fill
            minimal
            disabled={
              /*
               * See Blueprint docs, we have to use an AnchorButton for a11y
               * when putting a tooltip on a disabled button
               */
              true
            }
          >
            <div className={tw("p-2", "text-base")}>{t`Redeem`}</div>
          </AnchorButton>
        </Tooltip2>
      ) : (
        <Button fill minimal intent={Intent.SUCCESS} onClick={openDrawer}>
          <div className={tw("p-2", "text-base")}>{t`Redeem`}</div>
        </Button>
      )}
      {!baseAsset ? null : (
        <RedeemYieldTokensDrawer
          isOpen={isDrawerOpen}
          yieldTokenInfo={yieldTokenInfo}
          userProxyAllowance={userProxyAllowance}
          account={account}
          baseAsset={baseAsset}
          library={library}
          onClose={() => setDrawerOpen(false)}
        />
      )}
    </Fragment>
  );
}
