import { ReactElement } from "react";
import { Button, Intent, Tag } from "@blueprintjs/core";
import { t } from "ttag";
import tw from "efi-tailwindcss-classnames";
import { SaveInput } from "efi-ui/save/SavePortfolioList/SaveInput";
import { useNumericInput } from "efi-ui/base/hooks/useNumericInput/useNumericInput";
import { PrincipalTokenInfo } from "tokenlists/types";
import { SwapKind } from "efi-ui/balancer/SwapKind";
import { Web3Provider } from "@ethersproject/providers";
import { useTokenBalanceOf } from "efi-ui/token/hooks/useTokenBalanceOf";
import { trancheContractsByAddress } from "efi/tranche/tranches";
import { formatBalance } from "efi/base/formatBalance";
import { getCryptoSymbol } from "efi/crypto/getCryptoSymbol";
import { getBaseAssetForTranche } from "efi/tranche/baseAssets";

interface SellPrincipalTokensFormProps {
  library: Web3Provider | undefined;
  account: string | null | undefined;
  principalToken: PrincipalTokenInfo;
}

export function SellPrincipalTokensForm(
  props: SellPrincipalTokensFormProps
): ReactElement {
  const {
    account,
    principalToken: {
      address: ptAddress,
      decimals: ptDecimals,
      symbol: ptSymbol,
    },
  } = props;
  // base asset
  const baseAsset = getBaseAssetForTranche(ptAddress);
  const baseAssetSymbol = getCryptoSymbol(baseAsset);

  // inputs
  const { stringValue: ptInputValue, setValue: onPrincipalTokenInputChange } =
    useNumericInput();

  // tranche
  const trancheContract = trancheContractsByAddress[ptAddress];
  const { data: ptBalanceOf } = useTokenBalanceOf(trancheContract, account);
  const ptBalanceLabel = formatBalance(ptBalanceOf, ptDecimals, ptDecimals);

  return (
    <div className={tw("flex", "items-center")}>
      <div className={tw("flex", "flex-col", "w-full", "space-y-2")}>
        <span
          className={tw("pb-4")}
        >{t`Sell your principal tokens for ${baseAssetSymbol}`}</span>
        <div className={tw("grid", "grid-cols-4", "gap-3")}>
          <SaveInput
            swapKind={SwapKind.GIVEN_IN}
            className={tw("col-span-3")}
            isValid
            showMaxButton
            assetIcon={
              <Tag minimal large className={tw("ml-2")}>
                {ptSymbol}
              </Tag>
            }
            value={ptInputValue}
            valueBalanceOf={ptBalanceOf}
            valueDecimals={ptDecimals}
            onValueChange={onPrincipalTokenInputChange}
          />
          <div>
            <Button
              fill
              outlined
              large
              intent={Intent.PRIMARY}
            >{t`Sell`}</Button>
          </div>
        </div>
        <div className={tw("grid", "grid-cols-4", "gap-3")}>
          <span
            className={tw("col-span-3", "text-right")}
          >{t`Available balance: ${ptBalanceLabel}`}</span>
        </div>
      </div>
    </div>
  );
}
