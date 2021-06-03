import { ReactElement } from "react";

import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Web3Provider } from "@ethersproject/providers";
import { AssetProxyTokenInfo, PrincipalTokenInfo } from "tokenlists/types";
import { jt, t } from "ttag";

import { makeEtherscanTokenUrl } from "efi-etherscan/links";
import tw from "efi-tailwindcss-classnames";
import { getCryptoSymbol } from "efi/crypto/getCryptoSymbol";
import { getTokenInfo } from "efi/tokenlists";
import { getBaseAssetForTranche } from "efi/tranche/baseAssets";

interface PrincipalTokenInformationProps {
  library: Web3Provider | undefined;
  account: string | null | undefined;
  principalToken: PrincipalTokenInfo;
}

export function PrincipalTokenInformation(
  props: PrincipalTokenInformationProps
): ReactElement {
  const {
    principalToken: {
      address: ptAddress,
      extensions: { position: wrappedPositionAddress },
    },
  } = props;

  const {
    name: vaultName,
    extensions: { vault: vaultAddress },
  } = getTokenInfo<AssetProxyTokenInfo>(wrappedPositionAddress);

  // base asset
  const baseAsset = getBaseAssetForTranche(ptAddress);
  const baseAssetSymbol = getCryptoSymbol(baseAsset);

  // tranche
  const tableRowLink = getVaultLink(vaultAddress, vaultName);

  return (
    <div className={tw("flex", "text-left")}>
      <div className={tw("flex", "flex-col", "w-full", "space-y-2")}>
        <span>{jt`Fixed yield is backed by ${baseAssetSymbol} deposited in ${tableRowLink}`}</span>
        <span>{getPrincipalTokenLink(ptAddress)}</span>
      </div>
    </div>
  );
}

function getPrincipalTokenLink(
  principalTokenAddress: string
): ReactElement | null {
  return (
    <a
      key="vault-link"
      target="_blank"
      rel="noreferrer"
      href={makeEtherscanTokenUrl(principalTokenAddress)}
    >
      {t`View this principal token on etherscan`}{" "}
      <sup>
        <Icon icon={IconNames.SHARE} iconSize={8} />
      </sup>
    </a>
  );
}

function getVaultLink(
  vaultAddress: string,
  vaultName: string
): ReactElement | null {
  return (
    <a
      key="vault-link"
      target="_blank"
      rel="noreferrer"
      href={makeEtherscanTokenUrl(vaultAddress)}
    >
      {vaultName}{" "}
      <sup>
        <Icon icon={IconNames.SHARE} iconSize={8} />
      </sup>
    </a>
  );
}
