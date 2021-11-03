import { ReactElement, useCallback, useState } from "react";

import { Button, Callout } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { formatUnits } from "ethers/lib/utils";

import tw from "efi-tailwindcss-classnames";
import { useTokenAllowance } from "efi-ui/token/hooks/useTokenApprovedForAmount";
import { RedeemPrincipalTokensDrawer } from "efi-ui/tranche/RedeemTokensDrawer/RedeemPrincipalTokensDrawer";
import { RedeemYieldTokensDrawer } from "efi-ui/tranche/RedeemTokensDrawer/RedeemYieldTokensDrawer";
import ContractAddresses from "efi/addresses";
import { getCryptoAssetForToken } from "efi/crypto/getCryptoAssetForToken";
import { isYieldToken } from "efi/interestToken/interestToken";
import { getPoolTokens } from "efi/pools/getPoolTokens";
import { PoolInfo } from "efi/pools/PoolInfo";
import { isPrincipalToken } from "efi/tranche/tranches";
import { PrincipalTokenInfo, YieldTokenInfo } from "tokenlists/types";
import { t } from "ttag";
import { useTokenBalanceUNSAFE } from "efi-ui/token/hooks/useTokenBalance";
import { isDust } from "efi/coins/isDust";
import { useTokenBalanceOf } from "efi-ui/token/hooks/useTokenBalanceOf";
import { BigNumber } from "ethers";

const { userProxyContractAddress } = ContractAddresses;

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

  return (
    <div
      className={tw(
        "flex",
        "flex-col",
        "justify-between",
        "py-2",
        "space-y-2",
        "h-full"
      )}
    >
      <Callout>
        <div>{t`Available to redeem`}</div>
        <div>{termAssetBalance}</div>
      </Callout>

      <Button
        disabled={!hasRedeemableBalance}
        className={tw("m-8")}
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
