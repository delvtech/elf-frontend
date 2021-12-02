import { ReactElement, useCallback, useState } from "react";

import { Button, Callout, Intent } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { BigNumber } from "ethers";
import { formatUnits } from "ethers/lib/utils";
import { PrincipalTokenInfo, YieldTokenInfo } from "tokenlists/types";
import { t } from "ttag";

import tw from "efi-tailwindcss-classnames";
import { LabeledText } from "efi-ui/base/LabeledText/LabeledText";
import { useTokenAllowance } from "efi-ui/token/hooks/useTokenApprovedForAmount";
import { useTokenBalanceUNSAFE } from "efi-ui/token/hooks/useTokenBalance";
import { useTokenBalanceOf } from "efi-ui/token/hooks/useTokenBalanceOf";
import { RedeemPrincipalTokensDrawer } from "efi-ui/tranche/RedeemTokensDrawer/RedeemPrincipalTokensDrawer";
import { RedeemYieldTokensDrawer } from "efi-ui/tranche/RedeemTokensDrawer/RedeemYieldTokensDrawer";
import ContractAddresses from "efi/addresses/addresses";
import { isDust } from "efi/coins/isDust";
import { getCryptoAssetForToken } from "efi/crypto/getCryptoAssetForToken";
import { formatYieldTokenShortSymbol } from "efi/interestToken/formatYieldTokenShortSymbol";
import { isYieldToken } from "efi/interestToken/interestToken";
import { getPoolTokens } from "efi/pools/getPoolTokens";
import { PoolInfo } from "efi/pools/PoolInfo";
import { formatPrincipalTokenShortSymbol } from "efi/tranche/format";
import { isPrincipalToken } from "efi/tranche/tranches";

const { userProxyContractAddress } = ContractAddresses;

const calloutClassName = tw(
  "flex",
  "flex-col",
  "p-4",
  "m-8",
  "items-center",
  "justify-center"
);

interface RedeemPanelProps {
  library: Web3Provider | undefined;
  account: string | null | undefined;
  poolInfo: PoolInfo;
}

export function RedeemPanel(props: RedeemPanelProps): ReactElement {
  const { account, library, poolInfo } = props;

  const { baseAssetInfo, termAssetInfo, termAssetContract } =
    getPoolTokens(poolInfo);
  const isPrincipal = isPrincipalToken(termAssetInfo);
  const isYield = isYieldToken(termAssetInfo);

  const baseAsset = getCryptoAssetForToken(baseAssetInfo.address);

  const { data: userProxyAllowanceBN } = useTokenAllowance(
    termAssetContract,
    account,
    userProxyContractAddress
  );

  const userProxyAllowance = formatUnits(
    userProxyAllowanceBN ?? 1,
    termAssetInfo.decimals
  );

  const termAssetBalance = useTokenBalanceUNSAFE(termAssetContract, account);
  const { data: termAssetBalanceBN = BigNumber.from(0) } = useTokenBalanceOf(
    termAssetContract,
    account
  );
  const hasRedeemableBalance = !isDust(
    termAssetBalanceBN,
    termAssetInfo.decimals
  );

  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const openDrawer = useCallback(() => {
    setDrawerOpen(true);
  }, []);
  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  const termTokenShortSymbol = isPrincipal
    ? formatPrincipalTokenShortSymbol(termAssetInfo as PrincipalTokenInfo)
    : formatYieldTokenShortSymbol(termAssetInfo as YieldTokenInfo);

  return (
    <div
      className={tw(
        "flex",
        "flex-col",
        "justify-center",
        "items-center",
        "py-2",
        "space-y-2",
        "h-full"
      )}
    >
      <Callout className={calloutClassName}>
        <span className={tw("mb-0")}>{t`Total balance`}</span>
        <LabeledText
          muted={false}
          className={tw("flex", "justify-center", "items-center")}
          containerClassName={tw("justify-center")}
          bold
          text={`${termAssetBalance.toFixed(6)} ${termTokenShortSymbol}`}
          label={""}
        />
      </Callout>

      <Button
        minimal
        outlined
        intent={Intent.PRIMARY}
        disabled={!hasRedeemableBalance}
        className={tw("w-full", "m-8")}
        large
        onClick={openDrawer}
      >{t`Redeem`}</Button>

      {isPrincipal && (
        <RedeemPrincipalTokensDrawer
          isOpen={isDrawerOpen}
          principalTokenInfo={termAssetInfo as PrincipalTokenInfo}
          userProxyAllowance={userProxyAllowance}
          account={account}
          baseAsset={baseAsset}
          library={library}
          onClose={closeDrawer}
        />
      )}
      {isYield && (
        <RedeemYieldTokensDrawer
          isOpen={isDrawerOpen}
          yieldTokenInfo={termAssetInfo as YieldTokenInfo}
          userProxyAllowance={userProxyAllowance}
          account={account}
          baseAsset={baseAsset}
          library={library}
          onClose={closeDrawer}
        />
      )}
    </div>
  );
}
