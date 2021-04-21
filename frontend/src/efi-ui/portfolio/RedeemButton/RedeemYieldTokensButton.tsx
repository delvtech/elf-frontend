import React, {
  Fragment,
  ReactElement,
  useCallback,
  useMemo,
  useState,
} from "react";

import { AnchorButton, Button, Intent } from "@blueprintjs/core";
import { Tooltip2 } from "@blueprintjs/popover2";
import { Web3Provider } from "@ethersproject/providers";
import { Tranche } from "elf-contracts/types/Tranche";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { CryptoAssetWithIcon } from "efi-ui/crypto/CryptoAssetWithIcon";
import { RedeemYieldTokensDrawer } from "efi-ui/tranche/RedeemTokensDrawer/RedeemYieldTokensDrawer";
import { convertEpochSecondsToDate } from "efi/base/convertEpochSecondsToDate";

interface RedeemYieldTokensButtonProps {
  account: string | null | undefined;
  library: Web3Provider | undefined;

  tranche: Tranche | undefined;
  baseAsset: CryptoAssetWithIcon | undefined;
}

export function RedeemYieldTokensButton({
  baseAsset,
  tranche,
  account,
  library,
}: RedeemYieldTokensButtonProps): ReactElement {
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const { data: unlockTimestamp } = useSmartContractReadCall(
    tranche,
    "unlockTimestamp"
  );
  const unlockDate = useMemo(() => convertEpochSecondsToDate(unlockTimestamp), [
    unlockTimestamp,
  ]);
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
          tranche={tranche}
          account={account}
          baseAsset={baseAsset}
          library={library}
          onClose={() => setDrawerOpen(false)}
        />
      )}
    </Fragment>
  );
}
