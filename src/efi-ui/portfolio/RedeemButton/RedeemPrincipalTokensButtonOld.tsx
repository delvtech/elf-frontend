import React, { Fragment, ReactElement, useCallback, useState } from "react";

import { AnchorButton, Button, Intent } from "@blueprintjs/core";
import { Tooltip2 } from "@blueprintjs/popover2";
import { Web3Provider } from "@ethersproject/providers";
import { formatUnits } from "ethers/lib/utils";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { useNowMs } from "efi-ui/base/hooks/useNowMs/useNowMs";
import { useTokenAllowance } from "efi-ui/token/hooks/useTokenAllowance";
import { RedeemPrincipalTokensDrawer } from "efi-ui/tranche/RedeemTokensDrawer/RedeemPrincipalTokensDrawer";
import { useTrancheCanPerform } from "efi-ui/tranche/useTrancheCanPerform";
import ContractAddresses from "efi/addresses/addresses";
import { convertEpochSecondsToDate } from "efi/base/convertEpochSecondsToDate/convertEpochSecondsToDate";
import { CryptoAsset } from "efi/crypto/CryptoAsset";
import { trancheContractsByAddress as principalTokenContractsByAddress } from "efi/tranche/tranches";
import { PrincipalTokenInfo } from "@elementfi/tokenlist";

const { userProxyContractAddress } = ContractAddresses;

interface RedeemPrincipalTokensButtonOldProps {
  account: string | null | undefined;
  library: Web3Provider | undefined;

  principalTokenInfo: PrincipalTokenInfo;
  baseAsset: CryptoAsset;
}

export function RedeemPrincipalTokensButtonOld({
  baseAsset,
  principalTokenInfo,
  account,
  library,
}: RedeemPrincipalTokensButtonOldProps): ReactElement {
  const nowMs = useNowMs();
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const {
    address,
    extensions: { unlockTimestamp },
  } = principalTokenInfo;
  const unlockDate = convertEpochSecondsToDate(unlockTimestamp);
  const canPerformWithdrawPrincipal = useTrancheCanPerform(
    address,
    "withdrawPrincipal"
  );

  const buttonDisabled =
    (unlockDate && unlockDate.getTime() > nowMs) ||
    !canPerformWithdrawPrincipal;

  const principalTokenContract =
    principalTokenContractsByAddress[principalTokenInfo.address];
  const { data: userProxyAllowanceBN } = useTokenAllowance(
    principalTokenContract,
    account,
    userProxyContractAddress
  );

  const userProxyAllowance = formatUnits(
    userProxyAllowanceBN ?? 1,
    principalTokenInfo.decimals
  );
  const openDrawer = useCallback(() => {
    setDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  if (!canPerformWithdrawPrincipal) {
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
        <RedeemPrincipalTokensDrawer
          isOpen={isDrawerOpen}
          principalTokenInfo={principalTokenInfo}
          userProxyAllowance={userProxyAllowance}
          account={account}
          baseAsset={baseAsset}
          library={library}
          onClose={closeDrawer}
        />
      )}
    </Fragment>
  );
}
