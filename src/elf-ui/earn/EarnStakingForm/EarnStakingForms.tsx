import { ReactElement } from "react";

import { Card } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { Signer } from "ethers";
import { PrincipalTokenInfo as TrancheInfo } from "tokenlists/types";
import { t } from "ttag";

import tw from "elf-tailwindcss-classnames";
import { StakeYieldTokensForm } from "elf-ui/earn/EarnStakingForm/StakeYieldTokensForm";
import { useStakingAPY } from "elf-ui/pools/hooks/useStakingAPY";
import { useDarkMode } from "elf-ui/prefs/useDarkMode/useDarkMode";
import { formatPercent } from "elf/base/formatPercent";
import { getPoolInfoForPrincipalToken } from "elf/pools/ccpool";
import { getPoolInfoForYieldToken } from "elf/pools/weightedPool";

import { StakePrincipalTokenForm } from "./StakePrincipalTokensForm";
import { Link } from "@reach/router";
import classNames from "classnames";

interface EarnStakingFormsProps {
  className?: string;
  library: Web3Provider | undefined;
  signer: Signer | undefined;
  account: string | null | undefined;
  trancheInfo: TrancheInfo;
  formDisabled?: boolean;
  submitDisabled?: boolean;
}

export function EarnStakingForms(props: EarnStakingFormsProps): ReactElement {
  const { className, account, library, signer, trancheInfo } = props;
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
    <div
      className={classNames(className, tw("flex", "justify-between", "w-full"))}
    >
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
