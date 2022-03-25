import { Classes, Intent } from "@blueprintjs/core";
import { PrincipalTokenInfo, TokenInfo } from "@elementfi/tokenlist";
import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import { formatBalance } from "base/formatBalance/formatBalance";
import classNames from "classnames";
import tw from "efi-tailwindcss-classnames";
import { getCryptoAssetForToken } from "elf/crypto/getCryptoAssetForToken";
import { ReactElement } from "react";
import { t } from "ttag";
import { useNumericInput } from "ui/base/hooks/useNumericInput/useNumericInput";
import { useCryptoBalanceOf } from "ui/crypto/hooks/useCryptoBalance/useCryptoBalance";
import { useDarkMode } from "ui/prefs/useDarkMode/useDarkMode";
import { TokenAmountInput2 } from "ui/token/TokenAmountInput/TokenAmountInput2";

interface BuyFixedRatesSwapProps {
  principalToken: PrincipalTokenInfo;
  inputToken: TokenInfo;
}

export function BuyFixedRatesZap({
  principalToken,
  inputToken,
}: BuyFixedRatesSwapProps): ReactElement {
  const { account, library } = useWeb3React<Web3Provider>();

  const inputAsset = getCryptoAssetForToken(inputToken.address);
  const inputAssetBalanceOf = useCryptoBalanceOf(library, account, inputAsset);
  const inputAssetDisplayBalance = formatBalance(
    inputAssetBalanceOf,
    inputToken.decimals,
  );
  const { stringValue: inputTokenValue, setValue: onInputChange } =
    useNumericInput();

  const { isDarkMode } = useDarkMode();

  const hasInputError = false; // replace
  const inputErrorMessage = "";
  return (
    <>
      <div className={tw("flex", "flex-col")}>
        <span className={tw("text-base", "text-left")}>{t`You Spend`}</span>
        {!!account && (
          <span
            className={classNames(Classes.TEXT_MUTED, tw("text-right", "mb-2"))}
          >{t`Balance: ${inputAssetDisplayBalance} ${inputToken.symbol}`}</span>
        )}
      </div>
      <div
        style={{
          background: isDarkMode ? "var(--bp3-dark-bg-color)" : "",
        }}
        className={classNames(tw("flex", "rounded", "mb-2"))}
      >
        <TokenAmountInput2
          showMaxButton
          placeholder="0.00"
          inputGroupStyle={{
            height: "72px",
            width: "100%",
            fontSize: "1.125rem",
          }}
          intent={hasInputError ? Intent.DANGER : Intent.NONE}
          value={inputTokenValue}
          maxAmount={inputAssetBalanceOf}
          tokenDecimals={inputToken.decimals}
          onValueChange={onInputChange}
        />
        {hasInputError && (
          <span
            className={classNames(
              tw(
                "text-xs",
                "text-right",
                "mb-2",
                isDarkMode ? "text-red-500" : "text-red-700",
              ),
            )}
          >
            {inputErrorMessage}
          </span>
        )}
      </div>
    </>
  );
}
