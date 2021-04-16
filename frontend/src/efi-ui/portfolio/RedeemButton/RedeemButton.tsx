import React, { Fragment, ReactElement, useState } from "react";

import { AnchorButton, Button, Intent } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { AbstractConnector } from "@web3-react/abstract-connector";
import { Tranche } from "elf-contracts/types/Tranche";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { CryptoAssetWithIcon } from "efi-ui/crypto/CryptoAssetWithIcon";
import { PoolContract } from "efi/pools/PoolContract";
import { Tooltip2 } from "@blueprintjs/popover2";
import { useSmartContractReadCall } from "efi-ui/contracts/useSmartContractReadCall/useSmartContractReadCall";
import { convertEpochSecondsToDate } from "efi/base/convertEpochSecondsToDate";
import { RedeemPrincipalTokensDrawer } from "efi-ui/tranche/RedeemPrincipalTokensDrawer/RedeemPrincipalTokensDrawer";

interface RedeemButtonProps {
  chainId: number | undefined;
  account: string | null | undefined;
  walletConnectionActive: boolean;
  connector: AbstractConnector | undefined;
  library: Web3Provider | undefined;
  pool: PoolContract | undefined;

  sellAmount: string | undefined;

  tranche: Tranche | undefined;
  baseAsset: CryptoAssetWithIcon | undefined;
}

export function RedeemButton({
  baseAsset,
  tranche,
  account,
  chainId,
  connector,
  library,
  pool,
  walletConnectionActive,
}: RedeemButtonProps): ReactElement {
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const { data: unlockTimestamp } = useSmartContractReadCall(
    tranche,
    "unlockTimestamp"
  );
  const unlockDate = convertEpochSecondsToDate(unlockTimestamp);

  const buttonDisabled = unlockDate && unlockDate.getTime() > Date.now();

  return (
    <Fragment>
      {buttonDisabled ? (
        <Tooltip2
          inheritDarkTheme={false}
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
        <Button
          fill
          minimal
          intent={Intent.PRIMARY}
          onClick={() => setDrawerOpen(true)}
        >
          <div className={tw("p-2", "text-base")}>{t`Redeem`}</div>
        </Button>
      )}
      {!baseAsset ? null : (
        <RedeemPrincipalTokensDrawer
          isOpen={isDrawerOpen}
          tranche={tranche}
          account={account}
          baseAsset={baseAsset}
          library={library}
          onClose={() => setDrawerOpen(false)}
          pool={pool}
        />
      )}
    </Fragment>
  );
}
