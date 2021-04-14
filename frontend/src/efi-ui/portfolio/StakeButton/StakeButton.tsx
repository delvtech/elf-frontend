import React, { Fragment, ReactElement, useState } from "react";

import { Button, Intent } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { AbstractConnector } from "@web3-react/abstract-connector";
import { Tranche } from "elf-contracts/types/Tranche";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { CryptoAssetWithIcon } from "efi-ui/crypto/CryptoAssetWithIcon";
import { StakePrincipalTokensTransactionDrawer } from "efi-ui/tranche/StakePrincipalTokensTransactionDrawer/StakePrincipalTokensTransactionDrawer";
import { PoolContract } from "efi/pools/PoolContract";

interface StakeButtonProps {
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

export function StakeButton({
  baseAsset,
  tranche,
  account,
  chainId,
  connector,
  library,
  pool,
  sellAmount,
  walletConnectionActive,
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
        <StakePrincipalTokensTransactionDrawer
          isOpen={isDrawerOpen}
          tranche={tranche}
          account={account}
          baseAsset={baseAsset}
          chainId={chainId}
          connector={connector}
          library={library}
          onClose={() => setDrawerOpen(false)}
          pool={pool}
          walletConnectionActive={walletConnectionActive}
        />
      )}
    </Fragment>
  );
}
