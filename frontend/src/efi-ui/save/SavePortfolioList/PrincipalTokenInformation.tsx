import { ReactElement } from "react";

import { Callout, Icon, Intent } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { Web3Provider } from "@ethersproject/providers";
import { AssetProxyTokenInfo, PrincipalTokenInfo } from "tokenlists/types";
import { jt, t } from "ttag";

import { makeEtherscanTokenUrl } from "efi-etherscan/links";
import tw from "efi-tailwindcss-classnames";
import { getCryptoSymbol } from "efi/crypto/getCryptoSymbol";
import { getTokenInfo } from "efi/tokenlists";
import { getBaseAssetForTranche } from "efi/tranche/baseAssets";
import { CalendarEvent, google } from "calendar-link";
import { getPrincipalPoolForTranche } from "efi/pools/ccpool";
import { useLocation } from "@reach/router";

interface PrincipalTokenInformationProps {
  library: Web3Provider | undefined;
  account: string | null | undefined;
  principalToken: PrincipalTokenInfo;
}

export function PrincipalTokenInformation(
  props: PrincipalTokenInformationProps
): ReactElement {
  const { origin } = useLocation();

  const {
    principalToken,
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

  const vaultLink = getVaultLink(vaultAddress, vaultName);

  return (
    <div className={tw("flex", "text-left")}>
      <div className={tw("flex", "flex-col", "w-full", "space-y-2")}>
        <span>{jt`Yield is backed by ${baseAssetSymbol} deposited in ${vaultLink}`}</span>
        <span>{getPrincipalTokenLink(ptAddress)}</span>
        <span>{getGoogleCalendarLink(principalToken)}</span>
        <Callout
          icon={null}
          intent={Intent.PRIMARY}
        >{jt`Earn additional yield on your principal tokens by adding them as liquidity to the ${getElementPoolLink(
          principalToken,
          origin
        )}`}</Callout>
      </div>
    </div>
  );
}

function getElementPoolLink(
  principalToken: PrincipalTokenInfo,
  origin: string
): ReactElement | null {
  const { address } = principalToken;
  const { address: poolAddress } = getPrincipalPoolForTranche(address);

  return (
    <a
      key="element-pool-link"
      target="_blank"
      rel="noreferrer"
      href={`${origin}/pools/${poolAddress}`}
    >
      {t`Element Pool`}{" "}
      <sup>
        <Icon icon={IconNames.SHARE} iconSize={8} />
      </sup>
    </a>
  );
}
function getGoogleCalendarLink(
  principalToken: PrincipalTokenInfo
): ReactElement | null {
  const {
    address,
    name,
    extensions: { unlockTimestamp },
  } = principalToken;

  const baseAsset = getBaseAssetForTranche(address);
  const baseAssetSymbol = getCryptoSymbol(baseAsset);

  const event: CalendarEvent = {
    title: t`Redeem ${name}`,
    description: t`The term has been reached. Visit https://element.fi to redeem your ${baseAssetSymbol}`,
    url: "https://element.fi",
    start: unlockTimestamp * 1000,
    duration: [1, "hour"],
  };

  return (
    <a
      key="google-calendar-link"
      target="_blank"
      rel="noreferrer"
      href={google(event)}
    >
      {t`Add term date to Google Calendar`}{" "}
      <sup>
        <Icon icon={IconNames.SHARE} iconSize={8} />
      </sup>
    </a>
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
