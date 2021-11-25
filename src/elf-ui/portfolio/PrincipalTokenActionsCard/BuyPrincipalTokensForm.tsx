import { Fragment, ReactElement, useCallback, useState } from "react";

import { Button, Callout, Intent } from "@blueprintjs/core";
import { Web3Provider } from "@ethersproject/providers";
import { PrincipalTokenInfo } from "tokenlists/types";
import { t } from "ttag";

import { getTokenAddressForBalancer } from "elf-balancer/getTokenAddressForBalancer";
import { SwapKind } from "elf-balancer/SwapKind";
import tw from "elf-tailwindcss-classnames";
import { useNumericInput } from "elf-ui/base/hooks/useNumericInput/useNumericInput";
import { useCalculatePrincipalTokenAmountOut } from "elf-ui/ccpools/useCalculatePrincipalTokenAmountOut";
import { findAssetIcon } from "elf-ui/crypto/CryptoIcon";
import { useCryptoBalanceOf } from "elf-ui/crypto/hooks/useCryptoBalance/useCryptoBalance";
import { useCanPerformPool } from "elf-ui/pools/hooks/usePoolCanPerform/usePoolCanPerform";
import { usePoolSpotPrice } from "elf-ui/pools/hooks/usePoolSpotPrice/usePoolSpotPrice";
import { useTokenYield } from "elf-ui/pools/hooks/useTokenYield";
import { useValidateBuyPrincipalTokenInput } from "elf-ui/pools/hooks/useValidateBuyPrincipalTokenInput";
import { SwapTokensTransactionConfirmationDrawer } from "elf-ui/swaps/SwapTokensTransactionConfirmationDrawer/SwapTokensTransactionConfirmationDrawer";
import { TokenAmountInput } from "elf-ui/token/TokenAmountInput/TokenAmountInput";
import { formatBalance } from "elf/base/formatBalance";
import { formatPercent } from "elf/base/formatPercent";
import { getCryptoAssetForToken } from "elf/crypto/getCryptoAssetForToken";
import { getCryptoDecimals } from "elf/crypto/getCryptoDecimals";
import { getCryptoSymbol } from "elf/crypto/getCryptoSymbol";
import {
  getPoolInfoForPrincipalToken,
  getPrincipalPoolContractForTranche,
} from "elf/pools/ccpool";

interface BuyPrincipalTokensFormProps {
  library: Web3Provider | undefined;
  account: string | null | undefined;
  principalToken: PrincipalTokenInfo;
}

export function BuyPrincipalTokensForm(
  props: BuyPrincipalTokensFormProps
): ReactElement {
  const {
    library,
    account,
    principalToken: {
      symbol: principalTokenSymbol,
      address: principalTokenAddress,
      extensions: { underlying: baseAssetAddress },
    },
  } = props;

  // inputs
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const { stringValue: baseAssetInputValue, setValue: onBaseAssetChange } =
    useNumericInput();
  const closeDrawer = useCallback(() => {
    onBaseAssetChange("");
    setDrawerOpen(false);
  }, [onBaseAssetChange]);

  // base asset
  const baseAsset = getCryptoAssetForToken(baseAssetAddress);
  const baseAssetBalancerAddress = getTokenAddressForBalancer(baseAsset);
  const BaseAssetIcon = findAssetIcon(baseAsset);
  const baseAssetSymbol = getCryptoSymbol(baseAsset);
  const baseAssetBalanceOf = useCryptoBalanceOf(library, account, baseAsset);
  const baseAssetDecimals = getCryptoDecimals(baseAsset);
  const baseAssetBalanceLabel = formatBalance(
    baseAssetBalanceOf,
    baseAssetDecimals,
    baseAssetDecimals
  );

  const principalToken = getCryptoAssetForToken(principalTokenAddress);
  const PrincipalTokenIcon = findAssetIcon(principalToken);

  // pool
  const poolInfo = getPoolInfoForPrincipalToken(principalTokenAddress);
  const poolContract = getPrincipalPoolContractForTranche(
    principalTokenAddress
  );
  const apy = useTokenYield(poolInfo, "principal");
  const formattedAPY = apy ? formatPercent(apy) : "-";
  const canPerformBuy = useCanPerformPool(poolInfo.address, "buy");

  const spotPrice = usePoolSpotPrice(poolContract, principalTokenAddress);

  // input validation
  const { amountOut } = useCalculatePrincipalTokenAmountOut(
    poolInfo,
    baseAssetInputValue
  );
  const { tokenOutError, tokenInError } = useValidateBuyPrincipalTokenInput(
    library,
    account,
    poolInfo,
    baseAssetInputValue
  );

  const buttonDisabled =
    !!tokenInError ||
    !!tokenOutError ||
    !+baseAssetInputValue || // cover the case where they type "0"
    !canPerformBuy;

  let buttonIntent: Intent = Intent.PRIMARY;
  if (tokenInError || tokenOutError || !canPerformBuy) {
    buttonIntent = Intent.DANGER;
  }

  return (
    <Fragment>
      <div className={tw("flex", "flex-col", "space-y-4")}>
        <div
          className={tw(
            "flex",
            "flex-col",
            "w-full",
            "space-y-2",
            "justify-center"
          )}
        >
          <span
            className={tw("pb-4")}
          >{t`Buy principal tokens with your ${baseAssetSymbol}`}</span>
          <span className={tw("pb-4")}>{t`Current APR: ${formattedAPY}`}</span>
          <div className={tw("grid", "grid-cols-4", "gap-3")}>
            <TokenAmountInput
              className={tw("col-span-3")}
              placeholder="0.00"
              errorMessage={tokenInError || tokenOutError}
              showMaxButton
              leftIcon={
                BaseAssetIcon ? (
                  <BaseAssetIcon
                    height={20}
                    width={20}
                    className={tw("ml-2")}
                  />
                ) : undefined
              }
              value={baseAssetInputValue}
              maxAmount={baseAssetBalanceOf}
              tokenDecimals={baseAssetDecimals}
              onValueChange={onBaseAssetChange}
            />
            <div>
              <Button
                fill
                outlined
                large
                disabled={buttonDisabled}
                intent={buttonIntent}
                onClick={openDrawer}
              >{t`Buy`}</Button>
            </div>
          </div>
          <div className={tw("grid", "grid-cols-4", "gap-3")}>
            <span
              className={tw("col-span-3", "text-right")}
            >{t`Available balance: ${baseAssetBalanceLabel}`}</span>
          </div>
        </div>
        {!canPerformBuy ? (
          <Callout intent={Intent.DANGER}>
            {t`Trading for this token has been temporarily disabled, please refer to our Discord or Twitter for further updates.`}
          </Callout>
        ) : null}
      </div>
      <SwapTokensTransactionConfirmationDrawer
        buttonLabel={t`Buy`}
        tokenInAddress={baseAssetBalancerAddress}
        tokenInSymbol={baseAssetSymbol}
        tokenInDecimals={baseAssetDecimals}
        tokenInAsset={baseAsset}
        tokenInIcon={BaseAssetIcon}
        tokenOutAddress={principalTokenAddress}
        tokenOutSymbol={principalTokenSymbol}
        tokenOutDecimals={baseAssetDecimals}
        tokenOutIcon={PrincipalTokenIcon}
        account={account}
        library={library}
        poolInfo={poolInfo}
        amountIn={baseAssetInputValue}
        amountOut={amountOut}
        swapKind={SwapKind.GIVEN_IN}
        spotPrice={spotPrice}
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
      />
    </Fragment>
  );
}
