import React, { Fragment, ReactElement, useState } from "react";

import { Button, Intent } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { AbstractConnector } from "@web3-react/abstract-connector";
import { InterestToken } from "elf-contracts/types/InterestToken";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { SellYieldTokensDrawer } from "efi-ui/graveyard/SellYieldTokensDrawer/SellYieldTokensDrawer";
import { TokenIcon } from "efi-ui/token/TokenIcon";
import { CryptoAsset } from "efi/crypto/CryptoAsset";
import { PoolContract } from "efi/pools/PoolContract";

interface SellYieldTokensButtonProps {
  chainId: number | undefined;
  account: string | null | undefined;
  walletConnectionActive: boolean;
  connector: AbstractConnector | undefined;
  library: Web3Provider | undefined;
  pool: PoolContract | undefined;

  maxSellAmount: string | undefined;

  yieldToken: InterestToken | undefined;
  baseAsset: CryptoAsset | undefined;
  baseAssetIcon: TokenIcon | undefined;
}

export function SellYieldTokensButton({
  baseAsset,
  baseAssetIcon,
  yieldToken,
  account,
  chainId,
  connector,
  library,
  pool,
  maxSellAmount,
  walletConnectionActive,
}: SellYieldTokensButtonProps): ReactElement {
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
        <SellYieldTokensDrawer
          isOpen={isDrawerOpen}
          yieldToken={yieldToken}
          account={account}
          baseAsset={baseAsset}
          baseAssetIcon={baseAssetIcon}
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
