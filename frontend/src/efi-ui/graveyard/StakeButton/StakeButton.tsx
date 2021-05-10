import React, { Fragment, ReactElement, useState } from "react";

import { Button, Intent } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { AbstractConnector } from "@web3-react/abstract-connector";
import { Tranche } from "elf-contracts/types/Tranche";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { StakePrincipalTokensDrawer } from "efi-ui/graveyard/StakePrincipalTokensDrawer/StakePrincipalTokensDrawer";
import { CryptoAsset } from "efi/crypto/CryptoAsset";
import { PoolContract } from "efi/pools/PoolContract";

interface StakeButtonProps {
  account: string | null | undefined;
  connector: AbstractConnector | undefined;
  library: Web3Provider | undefined;
  pool: PoolContract | undefined;

  sellAmount: string | undefined;

  tranche: Tranche | undefined;
  baseAsset: CryptoAsset | undefined;
}

export function StakeButton({
  baseAsset,
  tranche,
  account,
  connector,
  library,
  pool,
}: StakeButtonProps): ReactElement {
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  return (
    <Fragment>
      <Button
        fill
        minimal
        intent={Intent.PRIMARY}
        onClick={() => setDrawerOpen(true)}
      >
        <div className={tw("p-2", "text-base")}>{t`Stake`}</div>
      </Button>
      {!baseAsset ? null : (
        <StakePrincipalTokensDrawer
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
