import { ReactElement } from "react";

import { Card } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { Signer } from "ethers";
import { PrincipalTokenInfo as TrancheInfo } from "tokenlists/types";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { StakeYieldTokensForm } from "efi-ui/earn/EarnStakingForm/StakeYieldTokensForm";
import { useStakingAPY } from "efi-ui/pools/useStakingAPY";
import { useDarkMode } from "efi-ui/prefs/useDarkMode/useDarkMode";
import { formatPercent } from "efi/base/formatPercent";
import { getPoolInfoForPrincipalToken } from "efi/pools/ccpool";
import { getPoolInfoForYieldToken } from "efi/pools/weightedPool";

import { StakePrincipalTokenForm } from "./StakePrincipalTokensForm";
import { Link } from "@reach/router";

interface EarnStakingFormsProps {
  library: Web3Provider | undefined;
  signer: Signer | undefined;
  account: string | null | undefined;
  trancheInfo: TrancheInfo;
  formDisabled?: boolean;
  submitDisabled?: boolean;
}

export function EarnStakingForms(props: EarnStakingFormsProps): ReactElement {
  const { account, library, signer, trancheInfo } = props;
  const { isDarkMode } = useDarkMode();

  const principalPoolInfo = getPoolInfoForPrincipalToken(trancheInfo.address);
  const yieldPoolInfo = getPoolInfoForYieldToken(
    trancheInfo.extensions.interestToken
  );
  const ptStakingAPY = useStakingAPY(principalPoolInfo);
  const ytStakingAPY = useStakingAPY(yieldPoolInfo);

  const cardClassName = tw(
    "flex",
    "flex-col",
    "flex-1",
    "space-y-4",
    "border",
    {
      "border-gray-600": isDarkMode,
    }
  );

  return (
    <div className={tw("flex", "justify-between", "space-x-6", "w-full")}>
      <Card className={cardClassName}>
        <div
          className={tw("text-center", "font-semibold")}
        >{t`LP your Principal Tokens`}</div>
        <div className={tw("text-center")}>{t`LP APY: ${formatPercent(
          ptStakingAPY
        )}`}</div>
        <StakePrincipalTokenForm
          account={account}
          library={library}
          signer={signer}
          poolInfo={principalPoolInfo}
        />
        <Link
          to={`/pools/${principalPoolInfo.address}`}
          className={tw("text-center", "font-semibold")}
        >{t`Go to pool`}</Link>
      </Card>
      <Card className={cardClassName}>
        <div
          className={tw("text-center", "font-semibold")}
        >{t`LP your Yield Tokens`}</div>
        <div className={tw("text-center")}>{t`LP APY: ${formatPercent(
          ytStakingAPY
        )}`}</div>
        <StakeYieldTokensForm
          account={account}
          library={library}
          signer={signer}
          poolInfo={yieldPoolInfo}
        />
        <Link
          to={`/pools/${yieldPoolInfo.address}`}
          className={tw("text-center", "font-semibold")}
        >{t`Go to pool`}</Link>
      </Card>
    </div>
  );
}
