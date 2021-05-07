import React, { Fragment, ReactElement, useState } from "react";

import { Button, Intent } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { AbstractConnector } from "@web3-react/abstract-connector";
import { Tranche } from "elf-contracts/types/Tranche";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { SellPrincipalTokensTransactionDrawer } from "efi-ui/graveyard/SellPrincipalTokensTransactionDrawer/SellPrincipalTokensTransactionDrawer";
import { PoolContract } from "efi/pools/PoolContract";
import { CryptoAsset } from "efi/crypto/CryptoAsset";
import { TokenIcon } from "efi-ui/token/TokenIcon";

interface SellPrincipalTokensProps {
  chainId: number | undefined;
  account: string | null | undefined;
  connector: AbstractConnector | undefined;
  library: Web3Provider | undefined;
  pool: PoolContract | undefined;
  tranche: Tranche | undefined;
  baseAsset: CryptoAsset | undefined;
  baseAssetIcon: TokenIcon | undefined;
}

export function SellPrincipalTokensButton({
  baseAsset,
  baseAssetIcon,
  tranche,
  account,
  library,
  pool,
}: SellPrincipalTokensProps): ReactElement {
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
          baseAssetIcon={baseAssetIcon}
          library={library}
          onClose={() => setDrawerOpen(false)}
          pool={pool}
        />
      )}
    </Fragment>
  );
}
