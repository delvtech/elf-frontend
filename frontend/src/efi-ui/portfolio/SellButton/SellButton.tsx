import React, { FC, Fragment, useState } from "react";

import { Button, Intent } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { AbstractConnector } from "@web3-react/abstract-connector";
import { Tranche } from "elf-contracts/types/Tranche";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { CryptoAssetWithIcon } from "efi-ui/crypto/CryptoAssetWithIcon";
import { SellPrincipalTokensTransactionDrawer } from "efi-ui/tranche/SellPrincipalTokensTransactionDrawer/SellPrincipalTokensTransactionDrawer";
import { PoolContract } from "efi/pools/PoolContract";

interface SellButtonProps {
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

export const SellButton: FC<SellButtonProps> = ({
  baseAsset,
  tranche,
  account,
  chainId,
  connector,
  library,
  pool,
  sellAmount,
  walletConnectionActive,
}) => {
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  return (
    <Fragment>
      <Button
        fill
        minimal
        intent={Intent.PRIMARY}
        onClick={() => setDrawerOpen(true)}
      >
        <div className={tw("p-2", "text-base")}>{t`Sell`}</div>
      </Button>
      {!baseAsset ? null : (
        <SellPrincipalTokensTransactionDrawer
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
};
