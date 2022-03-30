import classNames from "classnames";
import tw from "efi-tailwindcss-classnames";
import { useDarkMode } from "ui/prefs/useDarkMode/useDarkMode";
import { Select } from "@blueprintjs/select";
import { TokenInfo } from "@elementfi/tokenlist";
import { t } from "ttag";
import { LabeledText } from "ui/base/LabeledText/LabeledText";
import { findAssetIconByAddress } from "ui/crypto/CryptoIcon";
import { ReactElement, useMemo } from "react";
import { useIsTailwindLargeScreen } from "ui/base/mediaBreakpoints";

const TokenInfoSelect = Select.ofType<TokenInfo>();

interface BuyFixedRatesInputSelectProps {
  inputTokens: TokenInfo[];
  selectedToken: TokenInfo;
  onTokenSelect: (item: TokenInfo) => void;
}

export function BuyFixedRatesInputSelect({
  inputTokens,
  selectedToken,
  onTokenSelect,
}: BuyFixedRatesInputSelectProps): ReactElement {
  const { isDarkMode } = useDarkMode();
  const inputTokenIconsByAddress = useMemo(
    () =>
      Object.fromEntries(
        inputTokens.map(({ address }) => [
          address,
          findAssetIconByAddress(address),
        ]),
      ),
    [inputTokens],
  );

  const isLargeScreen = useIsTailwindLargeScreen();

  const height = isLargeScreen ? 40 : 30;
  const width = height;

  return (
    <div className={tw("flex", "flex-col", "space-y-3")}>
      <span className={tw("text-base", "text-left")}>{t`Choose Token`}</span>

      <div
        style={{
          background: isDarkMode ? "var(--bp3-dark-bg-color)" : "",
        }}
        className={classNames(
          tw("flex", "p-1", "border", "rounded", "border-gray-500"),
        )}
      >
        <TokenInfoSelect
          items={inputTokens}
          itemPredicate={(_, s) => s.address !== selectedToken.address}
          itemRenderer={({ name, symbol, address }, { handleClick }) => (
            <div className={classNames(tw("p-1"))} onClick={handleClick}>
              <LabeledText
                containerClassName={tw("p-4")}
                icon={inputTokenIconsByAddress[address]({
                  height,
                  width,
                })}
                iconClassName={tw("flex-shrink-0", "mr-4")}
                large={isLargeScreen}
                labelClassName={tw("text-xs", "text-left")}
                label={symbol}
                textClassName={tw("lg:text-base", "text-left")}
                text={name}
              />
            </div>
          )}
          disabled={inputTokens.length === 1}
          onItemSelect={onTokenSelect}
          filterable={false}
        >
          <LabeledText
            containerClassName={tw("p-4")}
            icon={inputTokenIconsByAddress[selectedToken.address]({
              height,
              width,
            })}
            iconClassName={tw("flex-shrink-0", "mr-4")}
            large={isLargeScreen}
            labelClassName={tw("text-xs", "text-left")}
            label={selectedToken.symbol}
            textClassName={tw("lg:text-base", "text-left")}
            text={selectedToken.name}
          />
        </TokenInfoSelect>
      </div>
    </div>
  );
}
