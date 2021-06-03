import { ReactElement } from "react";
import { Button, Intent } from "@blueprintjs/core";
import { t } from "ttag";
import tw from "efi-tailwindcss-classnames";
import { SaveInput } from "efi-ui/save/SavePortfolioList/SaveInput";
import { useNumericInput } from "efi-ui/base/hooks/useNumericInput/useNumericInput";
import { PrincipalTokenInfo } from "tokenlists/types";
import { SwapKind } from "efi-ui/balancer/SwapKind";
import { getTokenInfo } from "efi/tokenlists";
import { getCryptoAssetForToken } from "efi/crypto/getCryptoAssetForToken";
import { useCryptoBalanceOf } from "efi-ui/crypto/hooks/useCryptoBalance/useCryptoBalance";
import { Web3Provider } from "@ethersproject/providers";
import { formatBalance } from "efi/base/formatBalance";
import { findAssetIcon2 } from "efi-ui/crypto/CryptoIcon";
import { getCryptoSymbol } from "efi/crypto/getCryptoSymbol";

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
      extensions: { underlying },
    },
  } = props;
  // inputs
  const { stringValue: baseAssetInputValue, setValue: onBaseAssetChange } =
    useNumericInput();

  // base asset
  const baseAsset = getCryptoAssetForToken(underlying);
  const baseAssetSymbol = getCryptoSymbol(baseAsset);
  const BaseAssetIcon = findAssetIcon2(baseAsset);
  const baseAssetBalanceOf = useCryptoBalanceOf(library, account, baseAsset);
  const baseAssetTokenInfo = getTokenInfo(underlying);
  const { decimals: baseAssetDecimals } = baseAssetTokenInfo;
  const baseAssetBalanceLabel = formatBalance(
    baseAssetBalanceOf,
    baseAssetDecimals,
    baseAssetDecimals
  );
  return (
    <div className={tw("flex")}>
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
        <div className={tw("grid", "grid-cols-4", "gap-3")}>
          <SaveInput
            swapKind={SwapKind.GIVEN_IN}
            className={tw("col-span-3")}
            isValid
            showMaxButton
            assetIcon={
              BaseAssetIcon ? (
                <BaseAssetIcon height={20} width={20} className={tw("ml-2")} />
              ) : undefined
            }
            value={baseAssetInputValue}
            valueBalanceOf={baseAssetBalanceOf}
            valueDecimals={baseAssetDecimals}
            onValueChange={onBaseAssetChange}
          />
          <div>
            <Button
              fill
              outlined
              large
              intent={Intent.PRIMARY}
            >{t`Buy`}</Button>
          </div>
        </div>
        <div className={tw("grid", "grid-cols-4", "gap-3")}>
          <span
            className={tw("col-span-3", "text-right")}
          >{t`Available balance: ${baseAssetBalanceLabel}`}</span>
        </div>
      </div>
    </div>
  );
}
