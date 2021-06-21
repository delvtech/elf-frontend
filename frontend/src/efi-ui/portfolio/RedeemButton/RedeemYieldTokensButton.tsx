import React, { Fragment, ReactElement, useCallback, useState } from "react";

import { AnchorButton, Button, Intent } from "@blueprintjs/core";
import { Tooltip2 } from "@blueprintjs/popover2";
import { Web3Provider } from "@ethersproject/providers";
import {
  PrincipalTokenInfo as TrancheInfo,
  YieldTokenInfo,
} from "tokenlists/types";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { RedeemYieldTokensDrawer } from "efi-ui/tranche/RedeemTokensDrawer/RedeemYieldTokensDrawer";
import { convertEpochSecondsToDate2 } from "efi/base/convertEpochSecondsToDate";
import { CryptoAsset } from "efi/crypto/CryptoAsset";
import { getTokenInfo } from "efi/tokenlists";

interface RedeemYieldTokensButtonProps {
  account: string | null | undefined;
  library: Web3Provider | undefined;

  yieldTokenInfo: YieldTokenInfo;
  baseAsset: CryptoAsset;
}

export function RedeemYieldTokensButton({
  baseAsset,
  yieldTokenInfo,
  account,
  library,
}: RedeemYieldTokensButtonProps): ReactElement {
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const trancheInfo = getTokenInfo<TrancheInfo>(
    yieldTokenInfo.extensions.tranche
  );
  const { unlockTimestamp } = trancheInfo.extensions;
  const unlockDate = convertEpochSecondsToDate2(unlockTimestamp);
  const buttonDisabled = unlockDate && unlockDate.getTime() > Date.now();

  const openDrawer = useCallback(() => {
    setDrawerOpen(true);
  }, []);

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
          account={account}
          baseAsset={baseAsset}
          library={library}
          onClose={() => setDrawerOpen(false)}
        />
      )}
    </Fragment>
  );
}
